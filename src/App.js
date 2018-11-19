import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

// Material-ui components
import Fade from '@material-ui/core/Fade'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

// Odometer stuff
import Odometer from 'react-odometerjs'
import './odometer-theme-plaza.css'

let backgroundImages = require('./backgrounds.json').backgrounds

let defaultTimes = {
  mainTimer: 1500,
  shorterTimer: 300,
  longerTimer: 900
}

class App extends Component {
  snackbarQueue = []
  constructor(props) {
    super(props)
    this.state = {
      activeTime: 'mainTimer',
      timers: {
        mainTimer: defaultTimes['mainTimer'],
        shorterTimer: defaultTimes['shorterTimer'],
        longerTimer: defaultTimes['longerTimer']
      },
      timeLeft: 1500,
      snackbarOpen: false,
      snackbarMessage: "",
      timer: null,
      imageNum: 0,
      activeTab: 0,
      screenAvailable: false,
    }
  }

  componentDidMount = () => {
    // Add space listener to toggle time
    document.addEventListener("keydown", this.spaceFunction, false);
    // set title to the time
    document.title = `[${this.getFormattedTime().string}] Solanum`
    // fade into main screen
    setTimeout(() => {
      this.setState({
        screenAvailable: true
      })
    }, 200)
    //document.addEventListener("keyup", this.spaceFunction, false);
  }

  spaceFunction = (event) => {
    // If space, toggle the timer
    if (event.keyCode === 32) {
      if (this.state.timer !== null) {
        this.stopTimer()
      } else {
        this.startTimer()
      }
      event.preventDefault()
    } 
  }

  // toggle time running
  toggleTimer = () => {
    if (this.state.timer === null) {
      this.startTimer()
    } else {
      this.stopTimer()
    }
  }

  // Change a certain timer
  changeTimer = (name, value, callback) => {
    let timers = Object.assign(this.state.timers)
    timers[name] = value
    this.setState({
      timers
    }, callback)
  }

  // get the current timer's value
  getCurrentTimer = () => {
    return this.state.timers[this.state.activeTime]
  }

  // start the timer
  startTimer = () => {
    // Create timer interval
    if (this.state.timer === null) {
      let timerInterval = setInterval(() => {
        // save other timer objects
        this.changeTimer(this.state.activeTime, this.getCurrentTimer() - 1, () => {
            document.title = `[${this.getFormattedTime().string}] Solanum`
            if (this.getCurrentTimer() < 0) {
              alert("Time's up!")
              this.resetTime()
            }
        })
      }, 1000)
      // open timer
      this.openSnackbar("Timer started")
      this.setState({
        timer: timerInterval,
      })
    } else {
      this.openSnackbar("Timer already running")
    }
  }

  stopTimer = () => {
    // Remove timer interval
    if (this.state.timer !== null) {
      clearInterval(this.state.timer)
      this.setState({
        timer: null
      })
      this.openSnackbar("Timer stopped")
    }
  }

  // return a string formatted time with minutes, seconds, and a complete string
  getFormattedTime = () => {
    let timeLeft = this.getCurrentTimer()
    let padTime = (time) => {
      while (time.length < 2)
          time = "0" + time;
      return time
    }
    let minutes = padTime(String(Math.floor(timeLeft / 60)))
    let seconds = padTime(String(Math.floor(timeLeft - minutes * 60)))
    return {
      minutes: minutes,
      seconds: seconds,
      string: `${minutes}:${seconds}`
    }
  }

  getSecondsDisplay = () => {
    let seconds = this.getFormattedTime().seconds
    return (
      <div>
        <Odometer style={{margin: 0}} value={seconds[0]}/>
        <Odometer style={{margin: 0}} value={seconds[1]}/>
      </div>
    )
  }

  getMinutesDisplay = () => {
    let minutes = this.getFormattedTime().minutes
    console.log(minutes)
    return (
      <div>
        <Odometer style={{margin: 0}} value={minutes[0]}/>
        <Odometer style={{margin: 0}} value={minutes[1]}/>
      </div>
    )
  }

  openSnackbar = (message) => {
    this.snackbarQueue.push({
      message,
      key: new Date().getTime()
    })
    if (this.state.snackbarOpen) {
      this.setState({
        snackbarOpen: false,
        snackbarMessage: ""
      })
    } else {
      this.processQueue()
    }
  }

  processQueue = () => {
    if (this.snackbarQueue.length > 0) {
      this.setState({
        snackbarMessage: this.snackbarQueue.shift(),
        snackbarOpen: true
      })
    }
  }

  closeSnackbar = (event, reason) => {
    this.setState({
      snackbarOpen: false,
      snackbarMessage: ""
    })
  }

  handleExited = () => {
    this.processQueue()
  }

  getSnackBar = () => {
    const { message, key } = this.state.snackbarMessage
    return (
      <div>
        <Snackbar
          key={key}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.snackbarOpen}
          onExited={this.state.handleExited}
          autoHideDuration={1000}
          onClose={this.closeSnackbar}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{message}</span>}
        />
      </div>
      )
  }

  incBackground = () => {
    let clear = (callback) => {
      this.setState({
        screenAvailable: false
      }, callback)
    }

    let changeBackground = (callback) => {
      this.setState({
        imageNum: (this.state.imageNum + 1) % backgroundImages.length,
      }, callback)
    }

    let reappear = (callback) => {
      this.setState({
        screenAvailable: true
      }, callback)
    }

    // first clear, then wait 200ms, then change background, then wait 200ms, then reappear.
    clear(() => {
      setTimeout(() => {
        changeBackground(() => {
          setTimeout(() => {
            reappear()
          }, 200)
        })
      }, 200)
    })
    
  }

  resetTime = () => {
    this.stopTimer()
    // reset to default time for now.
    this.changeTimer(this.state.activeTime, defaultTimes[this.state.activeTime])
  }

  handleTabChange = (event, value) => {
    this.stopTimer()
    let timers = ["mainTimer", "shorterTimer", "longerTimer"]
    this.setState({
      activeTab: value,
      activeTime: timers[value]
    }, () => {
      document.title = `[${this.getFormattedTime().string}] Solanum`
    })
  }

  render() {
    //console.log(`url(${backgroundImages[this.state.imageNum]})`)
    return (
      <Fade in={this.state.screenAvailable}>
        <div className="App" style={{backgroundImage: `url(${backgroundImages[this.state.imageNum]})`, minWidth: 1000}}>
          {this.getSnackBar()}
          <div className="Title" style={{fontSize: "5em", paddingTop: 40}}>
            Solanum
          </div>
          <div style={{margin: 10}}>
            <i>Solanum lycopersicum</i>. Pomodoro. 🍅
          </div>
          <Tabs 
            className="Tabs"
            indicatorColor="primary"
            textColor="primary"
            centered
            style={{margin: 0}}
            onChange={this.handleTabChange}
            value={this.state.activeTab}
          >
            <Tab label="Timer" />
            <Tab label="Shorter Break" />
            <Tab label="Longer Break" />
          </Tabs>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{marginTop: 10}}>
            <Paper className="Timer" style={{paddingLeft: 25, paddingRight: 30, paddingBottom: 15}}>
              {this.getMinutesDisplay()}
              <div style={{fontSize: "13em", color: '#648baf', fontFamily: 'lato'}}>:</div>
              {this.getSecondsDisplay()}
            </Paper>
          </Grid>
          <Button color="primary" onClick={this.resetTime} style={{margin: 10}}>Reset</Button>
          <Button color={this.state.timer === null ? "primary" : "secondary"} onClick={this.toggleTimer}>{this.state.timer === null ? "Start timer" : "Stop timer"}</Button>
          <Button color="primary" onClick={this.changeTime} style={{margin: 10}}>Change time</Button>
          <br/>
          <Button style={{margin: 10, position: 'absolute', top: 0, right: 0}} onClick={this.incBackground}>Change background</Button>
          
        </div>
      </Fade>
    );
  }
}

export default App;

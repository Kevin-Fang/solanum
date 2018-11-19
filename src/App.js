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

class App extends Component {
  snackbarQueue = []
  constructor(props) {
    super(props)
    this.state = {
      timeLeft: 1500,
      snackbarOpen: false,
      snackbarMessage: "",
      timer: null,
      imageNum: 0,
      activeTab: 0,
      screenAvailable: false
    }
  }

  componentDidMount = () => {
    // Add space listener to toggle time
    document.addEventListener("keydown", this.spaceFunction, false);
    // set title to the time
    document.title = `[${this.getFormattedTime().string}] Solanum`
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

  toggleTimer = () => {
    if (this.state.timer === null) {
      this.startTimer()
    } else {
      this.stopTimer()
    }
  }

  startTimer = () => {
    // Create timer interval
    if (this.state.timer === null) {
      let timer = setInterval(() => {
        this.setState({
          timeLeft: this.state.timeLeft - 1
        }, () => {
          document.title = `[${this.getFormattedTime().string}] Solanum`
        })
      }, 1000)
      this.openSnackbar("Timer started")
      this.setState({
        timer: timer,
      })
    } else {
      this.openSnackbar("Timer already running")
    }
  }

  stopTimer = () => {
    // Remove timer interval
    clearInterval(this.state.timer)
    this.setState({
      timer: null
    })
    this.openSnackbar("Timer stopped")
  }

  getFormattedTime = () => {
    let minutes = Math.floor(this.state.timeLeft / 60)
    let seconds = String(Math.floor(this.state.timeLeft - minutes * 60))
    let padTime = (time) => {
      while (time.length < 2)
          time = "0" + time;
      return time
    }
    return {
      minutes: minutes,
      seconds: padTime(seconds),
      string: `${minutes}:${padTime(seconds)}`
    }
  }

  getSecondsDisplay = () => {
    let seconds = this.getFormattedTime().seconds
    if (seconds.length === 2) {
      return (
        <div>
          <Odometer style={{margin: 0}} value={seconds[0]}/>
          <Odometer style={{margin: 0}} value={seconds[1]}/>
        </div>
      )
    } else {

    }
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
    this.setState({
      timeLeft: 1500
    })
  }

  handleTabChange = (event, value) => {
    this.setState({
      activeTab: value
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
            <Paper className="Timer" style={{paddingLeft: 25, paddingRight: 30}}>
                <Odometer value={this.getFormattedTime().minutes}/>
                <div style={{fontSize: "13em", color: '#648baf', fontFamily: 'lato'}}>:</div>
                {this.getSecondsDisplay()}
            </Paper>
          </Grid>
          <Button color="primary" onClick={this.resetTime} style={{margin: 10}}>Reset</Button>
          <Button color="primary" onClick={this.toggleTimer}>{this.state.timer === null ? "Start timer" : "Stop timer"}</Button>
          <Button color="primary" onClick={this.changeTime} style={{margin: 10}}>Change time</Button>
          <br/>
          <Button style={{margin: 10, position: 'absolute', top: 0, right: 0}} onClick={this.incBackground}>Change background</Button>
          
        </div>
      </Fade>
    );
  }
}

export default App;

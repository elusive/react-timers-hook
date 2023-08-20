import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useCaptureTimers} from "./useTimers/useCaptureTimers";

function App() {

    const {
        events,
        currentEvent,
        startCapture,
        stopCapture,
        reset,
        globalTime,
        eventTime
    } = useCaptureTimers("inquiry text 1");

    const startCaptureEvent = () => {
        startCapture("user reading");
    }

    const stopCaptureEvent = () => { 
        stopCapture("user reading");
    }

    const logging = () => {
        console.log(events);
        console.log(currentEvent);
    }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Testing useCaptureTimers Hook
        </p>
        <div className="container"> 
                <div className="timeContainer">
                    <span>Global: {globalTime}</span>
                    <span>Reading: {eventTime}</span>
                </div>
                <button onClick={startCaptureEvent} className="button">Start Reading</button>
                <button onClick={stopCaptureEvent} className="button">Stop Reading</button>
                <button onClick={logging} className="button">Log</button>
                <button onClick={reset} className="button">Reset</button>
            </div>  
        </header>
    </div>
  );
}

export default App;

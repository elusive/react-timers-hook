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
                    <span>Event: {eventTime}</span>
                </div>
                <p><button onClick={() => startCapture("user is reading")} className="button">Start Reading</button>
                <button onClick={() => stopCapture("user is reading")} className="button">Stop Reading</button></p>
                <p><button onClick={() => startCapture("user editing")} className="button">Start Editing</button>
                <button onClick={() => stopCapture("user editing")} className="button">Stop Editing</button></p>
                <p><button onClick={logging} className="button">Log</button>
                <button onClick={reset} className="button">Reset</button></p>
            </div>  
        </header>
    </div>
  );
}

export default App;

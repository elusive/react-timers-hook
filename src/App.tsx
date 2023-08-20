import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useCaptureTimers} from "./useTimers/useCaptureTimers";

function App() {

    const styles = {
        container: {
            width: "600px",
            height: "400px",
            margin: "auto",
            border: "2px solid black"
        },
        timeContainer: {
            width: "90px",
            font: "22px Arial bold",
            margin: "100 50"
        },
        button: {
            height: "50px",
            background: "#d9d9d9",
            margin: "10px",
            font: "18px Calibri"
        }
    };

//    const [global, setGlobal] = React.useState<Timer>();
//    const [evt, setEvt] = React.useState<Timer>();


    const {
        events,
        currentEvent,
        startCapture,
        stopCapture,
        reset,
        globalTime,
        eventTime
    } = useCaptureTimers("inquiry text 1");


    React.useEffect(() => {
        const interval = setInterval(() => {
//                            readFromTimers();
                    console.log(globalTime);
                    console.log(eventTime);
                }, 1000);

        return () => clearInterval(interval);
    });


    const startReading = () => {
        startCapture("reading");
    }

    const stopReading = () => { 
        stopCapture("reading");
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
        <div style={styles.container}> 
                <div style={styles.timeContainer}>Global: {globalTime}</div>
                <div style={styles.timeContainer}>Reading: {eventTime}</div>
                <button onClick={startReading} style={styles.button}>Start Reading</button>
                <button onClick={stopReading} style={styles.button}>Stop Reading</button>
                <button onClick={logging} style={styles.button}>Log</button>
            </div>  
        </header>
    </div>
  );
}

export default App;

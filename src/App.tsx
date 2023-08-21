import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import './App.css';
import {useCaptureTimers} from "./useTimers/useCaptureTimers";

export interface Timestamp {
    timestampNumber: number;
    startTime: number;
    endTime: number;
    captured: boolean;
}

export interface  CaptureEvent {
    captureEventNumber: number;
    type: string;
    timestamps: Timestamp[];
    captured: boolean;
}

export interface Inquiry {
    inquiryNumber: number;
    inquiryText: string;
    captures: CaptureEvent[];
}


// updates to CaptureDataState
export interface CaptureDataState {
  events: Inquiry[] | null;
  setEvents: (events: Inquiry[]) => void;
  currentEvent: string | null;
  setCurrentEvent: (captureType: string | null) => void;
  globalTime: number | null;
  setGlobalTime: (time: number | null) => void;
  eventTime: number | null;  
  setEventTime: (time: number | null) => void;
}



export const useCaptureDataStore = create<CaptureDataState>()(
    devtools(
        persist((set) => ({
            events: null,
            setEvents: (events: Inquiry[]) => set({ events }),
            currentEvent: null,
            setCurrentEvent: (captureType: string | null) => set({ currentEvent: captureType }),
            globalTime: null,
            setGlobalTime: (time: number | null) => set({ globalTime: time }),
            eventTime: null,
            setEventTime: (time: number | null) => set({ eventTime: time }),
        }), { 
                name: "required name", 
                storage: createJSONStorage(() => sessionStorage),
            })
    )
);

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

    const inquiry2 = useCaptureTimers("another inq");

    const logging = () => {
        console.log(`Inquiry 1 ${events}`);
        console.log(`Inquiry 2 ${events}`);
    }

  return (
    <div className="App">
      <header className="App-header">
        <div className="container"> 
            <h3>Inquiry 1</h3>
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
         <div className="container"> 
             <h3>Inquiry 2</h3>
                <div className="timeContainer">
                    <span>Global: {inquiry2.globalTime}</span>
                    <span>Event: {inquiry2.eventTime}</span>
                </div>
                <p><button onClick={() => inquiry2.startCapture("user is reading")} className="button">Start Reading</button>
                <button onClick={() => inquiry2.stopCapture("user is reading")} className="button">Stop Reading</button></p>
                <p><button onClick={() => inquiry2.startCapture("user editing")} className="button">Start Editing</button>
                <button onClick={() => inquiry2.stopCapture("user editing")} className="button">Stop Editing</button></p>
                <p><button onClick={logging} className="button">Log</button>
                <button onClick={inquiry2.reset} className="button">Reset</button></p>
          </div>  

        </header>
    </div>
  );
}

export default App;

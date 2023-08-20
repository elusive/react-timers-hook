import { useState, useEffect } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";


interface Timestamp {
    timestampNumber: number;
    startTime: number;
    endTime: number;
    captured: boolean;
}

interface  CaptureEvent {
    captureEventNumber: number;
    type: string;
    timestamps: Timestamp[];
    captured: boolean;
}

interface Inquiry {
    inquiryNumber: number;
    inquiryText: string;
    captures: CaptureEvent[];
}


// updates to CaptureDataState
interface CaptureDataState {
  events: Inquiry[] | null;
  setEvents: (events: Inquiry[]) => void;
  currentEvent: string | null;
  setCurrentEvent: (captureType: string | null) => void;
  globalTime: number | null;
  setGlobalTime: (time: number | null) => void;
  eventTime: number | null;  
  setEventTime: (time: number | null) => void;
}


// updates to useCaptureDataStore hook
const useCaptureDataStore = create<CaptureDataState>()(
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
        }), { name: "required name"} )
    )
);


/**
 * Desc:    Hook to capture start/stop times on events 
 * Returns: globalTimer, eventTimer, events, currentEvent
 */ 
export const useCaptureTimers = (inquiryText: string) => {

    // global state
    const { events, setEvents } = useCaptureDataStore(
        state => { return { events: state.events, setEvents: state.setEvents } });
    const { currentEvent, setCurrentEvent } = useCaptureDataStore(
        state => { return  { currentEvent: state.currentEvent, setCurrentEvent: state.setCurrentEvent } });
    const { globalTime, setGlobalTime } = useCaptureDataStore(
        state => { return { globalTime: state.globalTime, setGlobalTime: state.setGlobalTime } });
    const { eventTime, setEventTime } = useCaptureDataStore(
        state => { return { eventTime: state.eventTime, setEventTime: state.setEventTime } });

    // local state
    const [globalElapsed, globalElapsedSet] = useState<number>(0);
    const [eventElapsed, eventElapsedSet] = useState<number>(0);
    const [isRunning, isRunningSet] = useState<boolean>(false);
    const [isEventRunning, isEventRunningSet] = useState<boolean>(false);
    const [lastTimestampEnd, lastTimestampEndSet] = useState<Map<string, number> | null>(null);

    // we need to have an initialized value in capture data state . events
    let workingEvents = events || [];

    // start  
    const startCapture = async (captureType: string) => {
        
        // check for global time 
        const now = Date.now();
        if (!globalTime) {
            setGlobalTime(now);
            isRunningSet(true);
        }

        if (currentEvent === captureType && isEventRunning) {
            return; // already running
        }

        // check for existing type of capture and stop if found
        if (currentEvent && currentEvent !== captureType && isEventRunning) {
            await stopCapture(currentEvent);
        }
        
        // set new current event
        setCurrentEvent(captureType);

        // use last timestamp end value for start of new event
        //const eventStart = lastTimestampEnd?.has(captureType) ? lastTimestampEnd.get(captureType) : 0;

        // set start for the event time
        if (!eventTime) {
            setEventTime(now);
        }

        // start event timer running (start/resume)
        isEventRunningSet(true);

        // TODO: anything else for resume??
        // find/create current inquiry
        let isNewInquiry = false;
        let currentInquiry = workingEvents.find(evt => evt.inquiryText == inquiryText);
        let newInquiryNumber = Math.max(...workingEvents.map(evt => evt.inquiryNumber)) + 1;   
        if (!currentInquiry) {
            isNewInquiry = true;
            currentInquiry = {
                inquiryNumber: newInquiryNumber > 0 ? newInquiryNumber : 1,
                inquiryText: inquiryText,
                captures: []
            } as Inquiry
        }

        // find/create current capture
        let isNewCapture = false;
        let currentCapture = currentInquiry.captures.find(cap => cap.type === captureType);
        let newCaptureNumber = Math.max(...currentInquiry.captures.map(cap => cap.captureEventNumber)) + 1;
        if (!currentCapture) {
            isNewCapture = true;
            currentCapture = {
                captureEventNumber: newCaptureNumber > 0 ? newCaptureNumber : 1,
                type: captureType,
                captured: true,
                timestamps: []
            } as CaptureEvent;
        }

        // create new timestamp for current capture
        let lastTimestampNumber = Math.max(...currentCapture.timestamps.map(ts => ts.timestampNumber));
        lastTimestampNumber = lastTimestampNumber < 0 ? 1 : lastTimestampNumber;
        currentCapture.timestamps = [
            ...currentCapture.timestamps,
            { 
                timestampNumber: lastTimestampNumber + 1,
                startTime: isNewCapture ? 0 : Math.max(...currentCapture.timestamps.map(ts => ts.endTime)),
                endTime: 0,
                captured: false
            } as Timestamp
        ];

        // add current capture if new record
        if (isNewCapture) currentInquiry.captures.push(currentCapture);

        // add current query if new record
        if (isNewInquiry) workingEvents.push(currentInquiry);
        
        // update back to events
        setEvents(workingEvents);
    } 

    // stop
    const stopCapture = async (captureType: string) => {
        
        if (currentEvent !== captureType) {
            console.error(`Event type: ${captureType} not started`);
            return;
        }

        if (isEventRunning) {
            // calculate stop time
            const end = Date.now() - (globalTime || Date.now());
           
            // update timestamp for current capture
            let workingEvents = events || [];
            workingEvents = workingEvents.map(evt => {
                if (evt.inquiryText === inquiryText) {
                    evt.captures = evt.captures.map(capt => {
                        if (capt.type === captureType) {
                            capt.timestamps = capt.timestamps.map(ts => {
                                if (ts.endTime === 0 && !ts.captured) {
                                    ts.endTime = end;
                                    ts.captured = true;
                                }
                                return ts;
                            });
                        }
                        return capt;
                    });
                }
                return evt;
            });

            isEventRunningSet(false);
/*            lastTimestampEndSet(lte => {
                if (lte != null) {
                    lte.set(captureType, end);
                    return lte;
                } 
                return new Map<string, number>([[captureType, end]]);
            });  */
            setEvents(workingEvents);
            if (lastTimestampEnd) {
                lastTimestampEnd.set(captureType, end);
                lastTimestampEndSet(lastTimestampEnd);
            } else {
                lastTimestampEndSet(new Map<string, number>([[captureType, end]]));
            }
            eventElapsedSet(0);
        }
    }

    // reset
    const reset = () => {
        setEvents([]);
        setCurrentEvent(null);
        setGlobalTime(null);
        setEventTime(null);
        lastTimestampEndSet(null);

        isRunningSet(false);
        isEventRunningSet(false);
        globalElapsedSet(0);
        eventElapsedSet(0);
    }


    // use effect to set interval
    useEffect(() => {
        let intervalId = setInterval(() => {
            // update global timer
            if (globalTime != null && isRunning) {
                const currentElapsed = Date.now() - (globalTime || 0);
                if (currentElapsed < 0) {
                    setGlobalTime(Date.now());
                    globalElapsedSet(0);
                } else {
                    globalElapsedSet(currentElapsed);
                }
            }

            // update event timer
            if (eventTime != null && isEventRunning) {
                const currentEventElapsed = Date.now() - (eventTime || 0);
                eventElapsedSet(currentEventElapsed);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    })

    const formatTime = (timeMs: number): string =>  {
      const totalSeconds = Math.floor(timeMs / 1000);
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const hours = Math.floor(totalSeconds / 3600);

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }



    return {
        events,
        currentEvent,
        startCapture,
        stopCapture,
        reset,
        globalTime: formatTime(globalElapsed),
        eventTime: formatTime(eventElapsed),
    }
} 




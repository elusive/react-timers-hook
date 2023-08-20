import { wait } from "@testing-library/user-event/dist/utils";
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
  lastTimestampEnd : number | null;
  setLastTimestampEnd : (ts: number | null) => void;
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
            lastTimestampEnd: null,
            setLastTimestampEnd: (ts: number | null) => set({ lastTimestampEnd: ts}),
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
    const { lastTimestampEnd, setLastTimestampEnd } = useCaptureDataStore(
        state => { return { lastTimestampEnd: state.lastTimestampEnd, setLastTimestampEnd: state.setLastTimestampEnd } }); 

    // local state
    const [globalElapsed, setGlobalElapsed] = useState<number>(0);
    const [eventElapsed, setEventElapsed] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [captureType, setCapturType] = useState<string | null>(null);

    // we need to have an initialized value in capture data state . events
    let workingEvents = events || [];


    // use effect to set interval
    useEffect(() => {
        let intervalId = setInterval(() => {
            // update global timer
            if (globalTime) {
                const currentElapsed = Date.now() - (globalTime || 0);
                if (currentElapsed < 0) {
                    setGlobalTime(Date.now());
                    setGlobalElapsed(0);
                } else {
                    setGlobalElapsed(currentElapsed);
                }
            }

            // update event timer
            if (isRunning) {
                const currentEventElapsed = Date.now() - (eventTime || 0);
                setEventElapsed(currentEventElapsed);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    })


    // start  
    const startCapture = (captureType: string) => {
        
        // check for global time 
        const now = Date.now();
        if (!globalTime) {
            setGlobalTime(now);
        }

        // check for existing type of capture and stop if found
        if (currentEvent && currentEvent !== captureType) {
            stopCapture(currentEvent);
        } 

        // start event timer running (start/resume)
        if (!isRunning) {
            setIsRunning(true);
        }
        // TODO: anything else for resume??
                
        
        // set new current event
        setCurrentEvent(captureType);

        // use last timestamp end value for start of new event
        const eventStart = lastTimestampEnd === null ? 0 : lastTimestampEnd;

        // set start for the event time
        if (!eventTime) {
            setEventTime(now);
        }

        // find/create current inquiry
        let currentInquiry = workingEvents.find(evt => evt.inquiryText == inquiryText);
        let newInquiryNumber = Math.max(...workingEvents.map(evt => evt.inquiryNumber)) + 1;    // TODO:  new Id for inquiries??
        if (!currentInquiry) {
            currentInquiry = {
                inquiryNumber: newInquiryNumber,
                inquiryText: inquiryText,
                captures: []
            } as Inquiry
        }

        // update captures with current capture
        currentInquiry.captures = [
            ...(currentInquiry.captures || []),
            {
                captureEventNumber: 0,
                type: captureType,
                captured: true,
                timestamps: [
                    ...(currentInquiry.captures || []).find(c => c.type == captureType)?.timestamps || [],
                    { 
                        timestampNumber: NaN, // TODO: where to get timestampNumber??
                        startTime: eventStart,
                        endTime: 0,
                        captured: false  // set to true when endTime is set
                    } as Timestamp
                ]
            } as CaptureEvent
        ]

        // add current query
        workingEvents.push(currentInquiry);
        setEvents(workingEvents);
    } 

    // stop
    const stopCapture = (captureType: string) => {
        console.log(`stop capturing event: ${captureType}`);        
        
        if (currentEvent !== captureType) {
            console.error(`Event type: ${captureType} not started`);
            return;
        }

        if (isRunning) {
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

            setIsRunning(false);
            setEvents(workingEvents);
        }
    }

    // reset
    const reset = () => {
        setEvents([]);
        setCurrentEvent(null);
        setGlobalTime(null);
        setEventTime(null);
        setLastTimestampEnd(null);

        setCapturType(null);
        setGlobalElapsed(0);
        setEventElapsed(0);
        setIsRunning(false);
    }


    const formatTime = (time: number | null): string =>  {
        if (!time) time = 0;
        const dt = new Date(time);
        return dt.toLocaleTimeString('en-US')
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




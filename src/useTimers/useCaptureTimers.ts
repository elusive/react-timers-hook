import { useState, useEffect } from "react";
import { useCaptureDataStore } from "../App";
import { Inquiry, CaptureEvent, Timestamp } from "../App";

/**
 * Desc:    Hook to capture start/stop times on events 
 * Params: 
 *      inquiryText: string of the inquiryText identifies this Inquiry
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
    const [isRunning, isRunningSet] = useState<boolean>(!!globalTime);
    const [isEventRunning, isEventRunningSet] = useState<boolean>();

    // we need to have an initialized value in capture data state . events
    let workingEvents = events || [];
    
    // start  
    const startCapture = async (captureType: string) => {
        
        // check for global time 
        const now = Date.now();
        if (!globalTime) {
            setGlobalTime(now);
        }
        isRunningSet(true);

        if (currentEvent === captureType && isEventRunning) {
            return; // already running
        }

        // check for existing type of capture and stop if found
        if (currentEvent && currentEvent !== captureType && isEventRunning) {
            await stopCapture(currentEvent);
        }
        
        // set new current event
        setCurrentEvent(captureType);

        // set start for the event time
        setEventTime(now);

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
        let nextTimestampNumber = Math.max(...currentCapture.timestamps.map(ts => ts.timestampNumber)) + 1;
        currentCapture.timestamps = [
            ...currentCapture.timestamps,
            { 
                timestampNumber: nextTimestampNumber > 0 ? nextTimestampNumber : 1,
                startTime: globalElapsed, //isNewCapture ? 0 : Math.max(...currentCapture.timestamps.map(ts => ts.endTime)),
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
            eventElapsedSet(0);
        }
    }

    // reset
    const reset = () => {
        setEvents([]);
        setCurrentEvent(null);
        setGlobalTime(null);
        setEventTime(null);

        isRunningSet(false);
        isEventRunningSet(false);
        globalElapsedSet(0);
        eventElapsedSet(0);
    }

    // use effect to set interval
    useEffect(() => {
        let intervalId = setInterval(() => {
            // update global timer
            if (isRunning) {
                const currentElapsed = Date.now() - (globalTime || 0);
                if (currentElapsed < 0) {
                    setGlobalTime(Date.now());
                    globalElapsedSet(0);
                } else {
                    globalElapsedSet(currentElapsed);
                }
            }

            // update event timer
            if (isEventRunning) {
                const currentEventElapsed = Date.now() - (eventTime || 0);
                eventElapsedSet(currentEventElapsed);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    });

    useEffect(() => {
        // update isRunnings based on globalTime so that we 
        // see changes to globalTime when reset in another 
        // instance of the hook
        isRunningSet(!!globalTime);
        if (!globalTime) {
            globalElapsedSet(0);
            eventElapsedSet(0);
            isEventRunningSet(false);
        }
    }, [globalTime]);


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




import { useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useTimer, Timer } from "./timer";

interface Timestamp {
    timestampNumber: number;
    startTime: number;
    endTime: number;
    captured: boolean;
}

interface Inquiry {
    inquiryNumber: number;
    inquiryText: string;
    captures: {
        captureEventNumber: number;
        type: string;
        timestamps: Timestamp[];
        captured: boolean;
    }[];
}


// updates to CaptureDataState
interface CaptureDataState {
  events: Inquiry[] | null;
  setEvents: (events: Inquiry[]) => void;
  currentEvent: string | null;
  setCurrentEvent: (event: string | null) => void;
  globalTimer: Timer | null; // using Timer class
  setGlobalTimer: (timer: Timer | null) => void;
  eventTimer: Timer | null;  // using Timer class
  setEventTimer: (timer: Timer | null) => void;
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
            setCurrentEvent: (event: string | null) => set({ currentEvent: event }),
            globalTimer: null,
            setGlobalTimer: (timer: Timer | null) => set({ globalTimer: timer }),
            eventTimer: null,
            setEventTimer: (timer: Timer | null) => set({ eventTimer: timer }),
            lastTimestampEnd: null,
            setLastTimestampEnd: (ts: number | null) => set({ lastTimestampEnd: ts}),
        }), { name: "required name"} )
    )
);


/**
 * Desc:    Hook to capture start/stop times on events 
 * Returns: globalTimer, eventTimer, events, currentEvent
 */ 
export const useCaptureTimers = (category: string) => {
    const { events, setEvents } = useCaptureDataStore(
        state => { return { events: state.events, setEvents: state.setEvents } });
    const { currentEvent, setCurrentEvent } = useCaptureDataStore(
        state => { return  { currentEvent: state.currentEvent, setCurrentEvent: state.setCurrentEvent } });
    const { globalTimer, setGlobalTimer } = useCaptureDataStore(
        state => { return { globalTimer: state.globalTimer, setGlobalTimer: state.setGlobalTimer } });
    const { eventTimer, setEventTimer } = useCaptureDataStore(
        state => { return { eventTimer: state.eventTimer, setEventTimer: state.setEventTimer } });
    const { lastTimestampEnd, setLastTimestampEnd } = useCaptureDataStore(
        state => { return { lastTimestampEnd: state.lastTimestampEnd, setLastTimestampEnd: state.setLastTimestampEnd } }); 


    // start  
    const start = async (eventName: string): void => {
        const now = Date.now();
        if (globalTimer == null) {
            setGlobalTimer(new Timer(now));
        }
    }

    return {
        events,
        globalTimer,
        eventTimer,
    }
} 

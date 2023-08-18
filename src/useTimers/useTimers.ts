import { useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useTimer, Timer } from "./timer";

export interface Timestamp {
    timestampNumber: number;
    startTime: number;
    endTime: number;
    captured: boolean;
}

export interface Inquiry {
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
export const useCaptureDataStore = create<CaptureDataState>()(
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



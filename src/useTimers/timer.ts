import React from "react";


/**
 * Timer class for tracking elapsed time by the elapsed
 * and providing the current formatted time elapsed as string.
 */
export class Timer {
    public startMs: number;
    public elapsedSeconds: number = 0;

    _intervalId: number | undefined; 

    constructor(start: number) {
        this.startMs = start; 
    }

    public formatTime(): string {
        const dt = new Date(this.startMs + (this.elapsedSeconds * 1000));
        return dt.toLocaleTimeString('en-US')
    }

    public start(): void {
        this._intervalId = window.setInterval(() => {
            this.elapsedSeconds += 1;
        }, 1000);
    }

    public stop(): number {
        window.clearInterval(this._intervalId);
        return Date.now() - this.startMs;
    }

    public isRunning(): boolean {
        return this._intervalId !== null;
    }
}


export const useTimer = (startms: number) : Timer => {
    return new Timer(startms);
}

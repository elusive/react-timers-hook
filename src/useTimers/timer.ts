export class Timer {
    public startMs: number;
    public elapsedSeconds: number = 0;
    
    _intervalId: any; 

    constructor(start: number) {
        this.startMs = start; 
    }

    public formatTime(): string {
        const dt = new Date(this.startMs + (this.elapsedSeconds * 1000));
        return dt.toLocaleTimeString('en-US')
    }

    public start(): void {
        this._intervalId = setInterval(() => {
            this.elapsedSeconds += 1;
        }, 1000);

    }

    public stop(): void {
        clearInterval(this._intervalId);
    }
}


export const useTimer = (startms: number) : Timer => {
    return new Timer(startms);
}

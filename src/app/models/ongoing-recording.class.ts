import { BehaviorSubject } from "rxjs";

/**
 * A class representing an ongoing recording
 *
 * @export
 * @class OngoingRecording
 * @typedef {OngoingRecording}
 */
export class OngoingRecording {
    /**
     * A BehaviorSubject that emits when the current recording is stopped
     *
     * @type {*}
     */
    stopped$ = new BehaviorSubject<boolean>(false);
    /**
     * The MediaRecorder object that is responsible for the ongoing recording
     *
     * @type {?MediaRecorder}
     */
    mediaRecorder?: MediaRecorder;
    /**
     * Webm datachunks of the current recording
     *
     * @type {any[]}
     */
    chunks: any[] = [];

    /**
     * Function that once called, passes a .stop() call to the working MediaRecorder
     * 
     * Stops the current ongoing record
     */
    stopRecording(): void {
        this.mediaRecorder?.stop();
    }
}
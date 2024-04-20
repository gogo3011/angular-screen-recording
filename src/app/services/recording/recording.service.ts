import { Injectable, NgZone } from '@angular/core';
import { Observable, combineLatest, from, map, noop, take } from 'rxjs';
import { Recording } from '../../models/recording.class';
import { LocalStorageService } from '../local-storage/local-storage.service';
import * as uuid from 'uuid';
import { OngoingRecording } from '../../models/ongoing-recording.class';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { OpfsService } from '../opfs/opfs.service';

/**
 * Service responsible for the recording process
 *
 * @export
 * @class RecordingService
 * @typedef {RecordingService}
 */
@Injectable({
  providedIn: 'root'
})
export class RecordingService {

  /**
   * The local storage key, where we store the past recording information
   *
   * @static
   * @readonly
   * @type {"recordings"}
   */
  static readonly LOCAL_STORAGE_KEY = 'recordings';

  /**
   * BehaviourSubject containing all past recordings in the local storage
   *
   * @type {*}
   */
  recordings$ = this.localStorage.getItem<Recording[]>(RecordingService.LOCAL_STORAGE_KEY);

  /**
   * Creates an instance of RecordingService.
   *
   * @constructor
   * @param {LocalStorageService} localStorage
   * @param {ThumbnailService} thumbnailService
   * @param {OpfsService} opfsService
   * @param {NgZone} ngZone
   */
  constructor(
    private readonly localStorage: LocalStorageService,
    private readonly thumbnailService: ThumbnailService,
    private readonly opfsService: OpfsService,
    private readonly ngZone: NgZone
  ) { }

  /**
   * Receives a recording object, adds an id and creation date and saves it in the recording db
   *
   * @param {Recording} recordingToAdd - recording object to be added to the recordings db
   */
  addRecording(recordingToAdd: Recording): void {
    recordingToAdd.uuid = uuid.v4()
    recordingToAdd.created = new Date();
    this.localStorage.setItem(RecordingService.LOCAL_STORAGE_KEY, [...(this.recordings$.value || []), recordingToAdd]);
  }

  /**
   * Deletes a recording from the recording db by its uuid
   *
   * @param {string} recordingUuidToRemove - uuid of the recording to be removed
   */
  removeRecording(recordingUuidToRemove: string): void {
    this.localStorage.setItem(RecordingService.LOCAL_STORAGE_KEY, this.recordings$.value.filter(r => r.uuid != recordingUuidToRemove));
  }

  /**
   * Returns an observable that once subscribed to starts a recording
   *
   * @returns {Observable<OngoingRecording>} - Returns the observable containing the ongoing recording object.
   */
  startRecording$(): Observable<OngoingRecording> {
    const currentRecording = new OngoingRecording();
    return from(navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })).pipe(
      map(stream => new MediaRecorder(stream, { mimeType: "video/webm" })),
      map(mediaRecorder => {
        mediaRecorder.ondataavailable = (e) => {
          e.data.size > 0 ? currentRecording.chunks.push(e.data) : noop
        };
        mediaRecorder.onstop = () => {
          this.ngZone.run(() => {
            this.onRecordingComplete(currentRecording);
            currentRecording.stopped$.next(true);
          });
          mediaRecorder.stream.getTracks().forEach(t => t.stop());
        };
        currentRecording.mediaRecorder = mediaRecorder;
        mediaRecorder.start(250);
        return currentRecording;
      })
    );
  }

  /**
   * Exports the saved recording videofile in a user specified location
   *
   * @param {Recording} recording
   * @returns {Observable<void>}
   */
  exportRecoding$(recording: Recording): Observable<void> {
    return this.opfsService.exportFile$(recording.fileUrl || '');
  }

  /**
   * Util function to initiate the saving process when a recording is completed.
   * Promps the user to give the recording a name and converts the chunks of the video to a webm blob
   * Triggers a filesave to the OPFS
   *
   * @private
   * @param {OngoingRecording} currentRecording - the ongoing recording that is complete and needs saving
   */
  private onRecordingComplete(currentRecording: OngoingRecording) {
    const filename = window.prompt("Recording title name", "video");
    const blob = new Blob(currentRecording.chunks, { type: "video/webm" });
    if (filename) {
      combineLatest([this.opfsService.saveFileOPFS$(blob, filename, 'webm'), this.thumbnailService.generateThumbnail$(blob)])
        .pipe(take(1)).subscribe(([filePath, base64]) => {
          if (filePath?.length) {
            let recording: Recording = new Recording();
            recording.title = filename;
            recording.fileUrl = filePath;
            recording.base64Thumbnail = base64;
            this.addRecording(recording);
          }
      });
    }
  }

}

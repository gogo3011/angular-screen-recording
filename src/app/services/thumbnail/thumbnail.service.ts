import { Injectable } from '@angular/core';
import { Observable, combineLatest, from, fromEvent, map, switchMap, take } from 'rxjs';

/**
 * Service responsible for generating a jpeg thumbnail based on a video blob
 *
 * @export
 * @class ThumbnailService
 * @typedef {ThumbnailService}
 */
@Injectable({
  providedIn: 'root'
})
export class ThumbnailService {

  /**
   * Creates an instance of ThumbnailService.
   *
   * @constructor
   */
  constructor() { }

  
  /**
   * Generates a jpeg base64 thumbnail based on the last frame of the video blob provided
   * by creating a video tag, loading the videoblob in it, skipping to the last frame, appending it in a canvas
   * and getting an image out of it.
   *
   * @param {Blob} blob - blob of the video
   * @returns {Observable<string>} Observable containing a base64 jpeg string of the generated thumbnail
   */
  generateThumbnail$(blob: Blob): Observable<string> {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");
    video.muted = true;
    video.src = URL.createObjectURL(blob);
    // Due to a chrome bug, we need to set the current time to an comically large value
    // Seems like webm doesn't support seeking on chrome, chrome also doesn't allow recording of mp4
    // Too bad :(
    video.currentTime = 1e101;
    const obs = combineLatest([fromEvent(video, 'loadeddata'), fromEvent(video, 'loadedmetadata'), fromEvent(video, 'timeupdate')]).pipe(
      take(1),
      map(() => {
        let ctx = canvas.getContext('2d');
        canvas.width = Math.floor(video.videoWidth / 5);
        canvas.height = Math.floor(video.videoHeight / 5);
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        video.pause();
        return canvas.toDataURL("image/jpeg");
      })
    );
    return obs;
  }
}

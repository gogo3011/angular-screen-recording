import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { RecordingService } from '../../../services/recording/recording.service';
import { BehaviorSubject, Observable, combineLatest, filter, map, shareReplay, skipWhile, startWith, switchMap, take, tap } from 'rxjs';
import { OngoingRecording } from '../../../models/ongoing-recording.class';
import { SpeedDialModule } from 'primeng/speeddial';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../pipes/safeUrl.pipe';
import { Recording } from '../../../models/recording.class';
import { VideoPlayerComponent } from '../../video-player/video-player.component';

/**
 * Home Page of the app. Contains a list of all recordings the user has created in the app
 *
 * @export
 * @class HomePageComponent
 * @typedef {HomePageComponent}
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SpeedDialModule, CommonModule, CardModule, SafeUrlPipe],
  providers: [DialogService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  /**
   * BehaviorSubject containing the search term to be used in filtering. If null or blank, no filtering should be done.
   *
   * @type {*}
   */
  searchTerm$ = new BehaviorSubject<string| null>(null);

  /**
   * setter input that passes the input to the searchTerm$ BehaviorSubject
   *
   * @type {string} - searchTerm to pass to the searchTerm$ BehaviorSubject
   */
  @Input()
  set searchTerm(searchTerm: string | null) {this.searchTerm$.next(searchTerm)}

  recordingService = inject(RecordingService);
  dialogService = inject(DialogService);
  currentRecording$ = new BehaviorSubject<OngoingRecording | null>(null);

  /**
   * Observable emitting all the recordings the user has made in the app.
   * 
   *  Also performs filtering by a search term applied to the titles of the recordings
   *
   * @type {Observable<Recording[]>}
   */
  recordings$: Observable<Recording[]> = combineLatest([this.recordingService.recordings$, this.searchTerm$]).pipe(
    map(([recordings, searchTerm]) => !!searchTerm ? recordings.filter(r => r.title?.includes(searchTerm)) : recordings)
  );

  /**
   * Observable emmiting a boolean indicating an ongoing recording
   *
   * @type {Observable<boolean>}
   */
  ongoingRecording$ = this.currentRecording$.pipe(
    filter(rec => rec !== null),
    switchMap(rec => rec!.stopped$),
    map(bool => !bool),
    startWith(false),
    shareReplay(1)
  );
  
  /**
   * Function that starts a recording
   */
  startRecording() {
    this.recordingService.startRecording$().pipe(
      take(1),
      tap(rec => this.currentRecording$.next(rec)),
    ).subscribe(res => {});
  }

  /**
   * Function that stops a recording
   */
  stopRecording() {
    if (this.currentRecording$.value) {
      this.currentRecording$.value.stopRecording();
    }
  }

  /**
   * Function that opens a dialog with a videoplayer with the passed recording
   *
   * @param {Recording} recording - recording to play
   */
  playRecording(recording: Recording) {
    this.dialogService.open(VideoPlayerComponent, {
      header: recording.title,
      width: "90%",
      data: {
        recording
      }
    })
  }

  /**
   * Function that initiates a recording export
   *
   * @param {Recording} recording - recording to export
   */
  exportRecording(recording: Recording) {
    this.recordingService.exportRecoding$(recording)
      .subscribe(res => res);
  }

}

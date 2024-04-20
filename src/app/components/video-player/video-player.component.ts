import { Component, OnInit, inject } from '@angular/core';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Recording } from '../../models/recording.class';
import { OpfsService } from '../../services/opfs/opfs.service';
import { BehaviorSubject, map, skipWhile, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safeUrl.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Video Player dialog component.
 *
 * @export
 * @class VideoPlayerComponent
 * @typedef {VideoPlayerComponent}
 * @implements {OnInit}
 */
@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements OnInit {

  opfsService = inject(OpfsService);

  /**
   * Instance of the dialog that contains the current VideoPlayerComponent instance
   *
   * @type {?DynamicDialogComponent}
   */
  instance?: DynamicDialogComponent;

  /**
   * The available recording, undefined if not available
   *
   * @type {BehaviorSubject<Recording | undefined>}
   */
  recording$: BehaviorSubject<Recording | undefined> = new BehaviorSubject<Recording | undefined>(undefined);

  /**
   * Description placeholder
   *
   * @type {*}
   */
  videoURL$ = this.recording$.pipe(
    takeUntilDestroyed(),
    skipWhile(rec => !rec || !rec?.fileUrl),
    switchMap(rec => this.opfsService.getFile$(rec?.fileUrl!)),
    map(file => URL.createObjectURL(file))
  )

  /**
   * Creates an instance of VideoPlayerComponent. Populates the dialog instance that initiated the VideoPlayerComponent instance
   *
   * @constructor
   * @param {DynamicDialogRef} ref
   * @param {DialogService} dialogService
   */
  constructor(public ref: DynamicDialogRef, private dialogService: DialogService) {
    this.instance = this.dialogService.getInstance(ref);
  }

  ngOnInit(): void {
    if (this.instance?.data) {
      this.recording$.next(this.instance.data['recording']);
    }
  }
}

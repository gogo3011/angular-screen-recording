import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Safe URL pipe that marks an external ULR as safe so Angular can use it
 *
 * @export
 * @class SafeUrlPipe
 * @typedef {SafeUrlPipe}
 * @implements {PipeTransform}
 */
@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  /**
   * Creates an instance of SafeUrlPipe.
   *
   * @constructor
   * @param {DomSanitizer} sanitized
   */
  constructor(private sanitized: DomSanitizer) { }
  /**
   * Marks the incoming URL as safe to trust
   *
   * @param {string} value - URL to mark as safe
   * @returns {*}
   */
  transform(value: string) {
    return this.sanitized.bypassSecurityTrustUrl(value);
  }
}
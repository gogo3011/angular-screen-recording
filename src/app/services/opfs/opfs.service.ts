import { Injectable } from '@angular/core';
import { Observable, Subject, combineLatest, from, map, switchMap, take, tap } from 'rxjs';

/**
 * OPFS service resposible for all OPFS operations in the app
 *
 * @export
 * @class OpfsService
 * @typedef {OpfsService}
 */
@Injectable({
  providedIn: 'root'
})
export class OpfsService {

  /**
   * Creates an instance of OpfsService.
   *
   * @constructor
   */
  constructor() { 
  }

  /**
   * Creates a FileSystemWritableFileStream of the specified path in the OPFS
   *
   * @param {string} filePath
   * @returns {Observable<FileSystemWritableFileStream>} - Observable containing the FileSystemWritableFileStream
   */
  getFileWriterStream$(filePath: string): Observable<FileSystemWritableFileStream> {
    return from(navigator.storage.getDirectory()).pipe(
      take(1),
      switchMap(root => from(root.getFileHandle(filePath, {create: true}))),
      switchMap(fileHandler => from(fileHandler.createWritable()))
    );
  }
  
  /**
   * Returns a File from the specified OPFS path
   *
   * @param {string} filePath
   * @returns {Observable<File>} - Observable containing the requested file
   */
  getFile$(filePath: string): Observable<File> {
    return from(navigator.storage.getDirectory()).pipe(
      take(1),
      switchMap(root => from(root.getFileHandle(filePath, {create: true}))),
      switchMap(fileHandler => from(fileHandler.getFile()))
    );
  }

  /**
   * Asks the user to specify a system path to save/export the OPFS file to the clients device
   *
   * @param {string} fileToExportPath - file to export
   * @returns {Observable<void>}
   */
  exportFile$(fileToExportPath: string): Observable<void> {
    const fileWritable$ = from(window.showSaveFilePicker({suggestedName: fileToExportPath})).pipe(
      switchMap(filePicker => filePicker.createWritable()),
    );
    return combineLatest([this.getFile$(fileToExportPath), fileWritable$]).pipe(
      take(1),
      tap(([exportFile, saveFile]) => saveFile.write(exportFile)),
      switchMap(([exportFile, saveFile]) => from(saveFile.close()))
    );
  }

  /**
   * Writes a blob to the OPFS
   *
   * @param {Blob} blob - blob to write
   * @param {string} filename - name of the 
   * @param {string} format
   * @returns {Observable<string>}
   */
  saveFileOPFS$(blob: Blob, filename: string, format: string): Observable<string> {
    const filePath = filename + '.' + format; 
    return combineLatest([this.getFileWriterStream$(filePath), blob.arrayBuffer()])
      .pipe(
        tap(([fileHandler, buffer]) => fileHandler.write(buffer)),
        tap(([fileHandler, buffer]) => fileHandler.close()),
        map(() => filePath)
    )
  }
}

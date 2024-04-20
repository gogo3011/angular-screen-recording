import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * A simple Cache interface containing a BehaviorSubject with a value mapped by a string key
 *
 * @interface ICache
 * @typedef {ICache}
 */
interface ICache { /**
 *  BehaviorSubject with a value mapped by a string key
 */
[key: string]: BehaviorSubject<any>; }

type serializable = object | Object;

/**
 * LocalStorageService reponsible for interacting with the localstorage Web Storage API. Saves data in a JSON format.
 *
 * @export
 * @class LocalStorageService
 * @typedef {LocalStorageService}
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  /**
   * Cache contaning already requested data 
   *
   * @private
   * @type {ICache}
   */
  private cache: ICache;

  /**
   * Creates an instance of LocalStorageService.
   *
   * @constructor
   */
  constructor() {
    this.cache = {};
  }

  /**
   * Sets a value of a key in the local storage
   * 
   * Also updates the value in the cache if needed
   *
   * @template {serializable} T - Type expected to be set and returned
   * @param {string} key - key to set
   * @param {T} value - value to set
   * @returns {BehaviorSubject<T>} - BehaviorSubject containing the set value
   */
  setItem<T extends serializable>(key: string, value: T): BehaviorSubject<T> {
    localStorage.setItem(key, JSON.stringify(value));

    if (this.cache[key]) {
      this.cache[key].next(value);
      return this.cache[key];
    }

    return this.cache[key] = new BehaviorSubject(value);
  }

  /**
   * Gets a value of a key from the local storage or returns value from the cache
   * 
   * Also persist the value in the cache if not available
   *
   * @template {serializable} T - Type expected to be returned
   * @param {string} key - key of the value to be returned
   * @returns {BehaviorSubject<T>} - BehaviorSubject containing the value or undefined if not present
   */
  getItem<T extends serializable>(key: string): BehaviorSubject<T> {
    if (this.cache[key])
      return this.cache[key];
    else
      return this.cache[key] = new BehaviorSubject(!!localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : undefined);
  }

  /**
   * Deletes an item from the localstorage and removes it from the cache
   *
   * @param {string} key - key to delete
   */
  removeItem(key: string) {
    localStorage.removeItem(key);
    if (this.cache[key])
      this.cache[key].next(undefined);
  }
}

/**
 * A recording class representing a already created record
 *
 * @export
 * @class Recording
 * @typedef {Recording}
 */
export class Recording {
    /**
     * UUID of the record
     *
     * @type {?string}
     */
    uuid?: string;
    /**
     * Title of the record
     *
     * @type {?string}
     */
    title?: string;
    /**
     * Url of the record in the OPFS
     *
     * @type {?string}
     */
    fileUrl?: string;
    /**
     * Date of the recording
     *
     * @type {?Date}
     */
    created?: Date;
    /**
     * base64 jpeg string of the thumbnail of this recording
     *
     * @type {?string}
     */
    base64Thumbnail?: string;
}
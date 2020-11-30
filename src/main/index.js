import { getJobStatusObservable, newJob$ } from './jobs';
import { map, switchMap, take, takeWhile } from 'rxjs/operators';
import { MESSAGE_JOB_REQUEST } from '../shared/constants';
import { messageToPrinter } from './exchange';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import '../printer';

export { downloadBlob } from './utils';

/**
 * @typedef {Object} WmsLayer
 * @property {'WMS'} type
 * @property {string} url
 * @property {string} layer Layer name.
 * @property {number} opacity Opacity, from 0 (hidden) to 1 (visible).
 * @property {boolean} [tiled=false] Whether the WMS layer should be requested as tiles.
 */

/**
 * @typedef {Object} XyzLayer
 * @property {'XYZ'} type
 * @property {string} url URL or URL template for the layer; can contain the following tokens: `{a-d}` for randomly choosing a letter, `{x}`, `{y}` and `{z}`.
 * @property {number} opacity Opacity, from 0 (hidden) to 1 (visible).
 */

/**
 * @typedef {WmsLayer|XyzLayer} Layer
 */

/**
 * @typedef {Object} PrintSpec
 * @property {Layer[]} layers Array of `Layer` objects that will be rendered in the map; last layers will be rendered on top of first layers.
 * @property {[number, number]|[number, number, string]} size Width and height in pixels, or in the specified unit in 3rd place; valid units are `px`, `mm`, `cm`, `m` and `in`.
 * @property {[number, number]} center Longitude and latitude of the map center.
 * @property {number} dpi Dot-per-inch, usually 96 for a computer screen and 300 for a detailed print.
 * @property {number} scale Scale denominator.
 * @property {string} projection EPSG projection code.
 */

/**
 * @typedef {Object} PrintStatus
 * @property {number} id Job id.
 * @property {PrintSpec} spec Job initial spec.
 * @property {number} progress Job progress, from 0 to 1.
 * @property {'pending' | 'ongoing' | 'finished'} status Job status.
 * @property {Blob} [imageBlob] Finished image blob.
 */

/**
 * Starts generating a map image from a print spec.
 * @param {PrintSpec} printSpec
 * @return {Promise<Blob>} Promise resolving to the final image blob.
 */
export function print(printSpec) {
  messageToPrinter(MESSAGE_JOB_REQUEST, { spec: printSpec });
  return newJob$
    .pipe(
      take(1),
      switchMap((job) => getJobStatusObservable(job.id)),
      takeWhile((job) => job.progress < 1, true),
      map((job) => job.imageBlob)
    )
    .toPromise();
}

export function queuePrint() {
  console.warn('Not implemented yet');
}

export function getJobsStatus() {
  console.warn('Not implemented yet');
}

export function getJobStatus() {
  console.warn('Not implemented yet');
}

export function cancelJob() {
  console.warn('Not implemented yet');
}

export function registerProjection() {
  proj4.defs(
    'EPSG:2154',
    '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
  );
  register(proj4);
}

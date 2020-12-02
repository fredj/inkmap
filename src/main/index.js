import { map, switchMap, take, takeWhile } from 'rxjs/operators';

import '../printer';
import { MESSAGE_JOB_REQUEST } from '../shared/constants';
import { registerWithExtent } from '../shared/projections';
import { messageToPrinter } from './exchange';
import { getJobStatusObservable, newJob$ } from './jobs';

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
 * @typedef {Object} ProjectionDefinition
 * @property {string} name Projection name written as `prefix:code`.
 * @property {string} proj4 Proj4 definition.
 * @property {[number, number, number, number]} bbox Projection validity extent.
 */

/**
 * @typedef {Object} PrintSpec
 * @property {Layer[]} layers Array of `Layer` objects that will be rendered in the map; last layers will be rendered on top of first layers.
 * @property {[number, number]|[number, number, string]} size Width and height in pixels, or in the specified unit in 3rd place; valid units are `px`, `mm`, `cm`, `m` and `in`.
 * @property {[number, number]} center Longitude and latitude of the map center.
 * @property {number} dpi Dot-per-inch, usually 96 for a computer screen and 300 for a detailed print.
 * @property {number} scale Scale denominator.
 * @property {string} projection Projection name written as `prefix:code`.
 * @property {ProjectionDefinition} projectionDefinition Projection definition to be newly registered.
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

/**
 * Register a new projection from a projection definition.
 * @param {ProjectionDefinition} definition
 */
export function registerProjection(definition) {
  registerWithExtent(definition.name, definition.proj4, definition.bbox);
}

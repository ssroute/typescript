import { Point, RouteResult } from './types';
import { Graph } from './graph';
import { findRoute as findRouteInternal } from './router';

// Lazy-load graph to avoid loading data on module import
let graphInstance: Graph | null = null;

/**
 * Get or create the graph instance
 *
 * @returns Graph instance
 */
function getGraph(): Graph {
  if (!graphInstance) {
    graphInstance = new Graph();
  }
  return graphInstance;
}

/**
 * Find the shortest route between two geographic points
 *
 * @param origin - Starting point with latitude and longitude
 * @param destination - Ending point with latitude and longitude
 * @returns Route result containing GeoJSON LineString, distance in nautical miles, and waypoint count
 * @throws Error if route cannot be found
 *
 * @example
 * ```typescript
 * const result = findRoute(
 *   { lat: 50.79996296930812, lon: -1.1140555835574875 },
 *   { lat: 50.662867292391944, lon: -1.6090346985522723 }
 * );
 * console.log(`Distance: ${result.distance} nm`);
 * console.log(`Waypoints: ${result.waypoints}`);
 * ```
 */
export function findRoute(origin: Point, destination: Point): RouteResult {
  const graph = getGraph();
  return findRouteInternal(graph, origin, destination);
}

/**
 * Find the shortest distance between two geographic points (without full route)
 *
 * @param origin - Starting point with latitude and longitude
 * @param destination - Ending point with latitude and longitude
 * @returns Distance in nautical miles
 * @throws Error if route cannot be found
 *
 * @example
 * ```typescript
 * const distance = findDistance(
 *   { lat: 50.79996296930812, lon: -1.1140555835574875 },
 *   { lat: 50.662867292391944, lon: -1.6090346985522723 }
 * );
 * console.log(`Distance: ${distance} nm`);
 * ```
 */
export function findDistance(origin: Point, destination: Point): number {
  const result = findRoute(origin, destination);
  return result.distance;
}

// Export types for consumers
export type { Point, RouteResult } from './types';

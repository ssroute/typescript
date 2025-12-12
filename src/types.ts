import { LineString } from 'geojson';

/**
 * Geographic point with latitude and longitude in WGS84/EPSG:4326 coordinate system
 * 
 * Coordinates are in decimal degrees:
 * - Latitude (lat): -90 to 90 degrees
 * - Longitude (lon): -180 to 180 degrees
 */
export interface Point {
  lat: number;
  lon: number;
}

/**
 * Result of route finding operation
 */
export interface RouteResult {
  /** GeoJSON LineString representing the route */
  route: LineString;
  /** Total distance in nautical miles */
  distance: number;
  /** Number of waypoints (nodes) in the route */
  waypoints: number;
}

/**
 * Internal representation of a graph node
 */
export interface GraphNode {
  id: number;
  lat: number;
  lon: number;
}

/**
 * Adjacency list entry for graph traversal
 */
export interface AdjacencyEntry {
  nodeId: number;
  distance: number;
}

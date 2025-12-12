import { Point } from './types';

/**
 * Earth's equatorial radius in nautical miles (WGS84)
 * WGS84 equatorial radius: 6,378,137 meters = 3,443.918 nautical miles
 */
const EARTH_RADIUS_NM = 3443.918; // WGS84 equatorial radius in nautical miles

/**
 * Calculate the Haversine distance between two points in nautical miles
 * 
 * Uses WGS84 Earth radius for distance calculations. The Haversine formula
 * provides a spherical approximation of Earth's surface, which is suitable
 * for maritime routing applications.
 *
 * @param point1 - First geographic point (WGS84/EPSG:4326)
 * @param point2 - Second geographic point (WGS84/EPSG:4326)
 * @returns Distance in nautical miles
 */
export function haversineDistance(point1: Point, point2: Point): number {
  const lat1Rad = toRadians(point1.lat);
  const lat2Rad = toRadians(point2.lat);
  const deltaLatRad = toRadians(point2.lat - point1.lat);
  const deltaLonRad = toRadians(point2.lon - point1.lon);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_NM * c;
}

/**
 * Convert degrees to radians
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

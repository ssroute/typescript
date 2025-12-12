import { findRoute, findDistance } from '../src/index';

// Test cases for route finding with expected distance ranges
const routeTestCases = [
  {
    description: 'short distance route',
    origin: { lat: 50.79996296930812, lon: -1.1140555835574875 },
    destination: { lat: 50.662867292391944, lon: -1.6090346985522723 },
    minDistance: 22,
    maxDistance: 24,
  },
  {
    description: 'long distance route',
    origin: { lat: 50.75208491796645, lon: -1.1056387018858884 },
    destination: { lat: 56.08471477978714, lon: -3.0009372052519425 },
    minDistance: 470,
    maxDistance: 480,
  },
  {
    description: 'medium distance route',
    origin: { lat: 36.64038, lon: 29.12758 },
    destination: { lat: 36.855, lon: 28.27417 },
    minDistance: 44,
    maxDistance: 50,
  },
];

describe('Router', () => {
  describe('findRoute', () => {
    it.each(routeTestCases)(
      'should find route for $description',
      ({ origin, destination, minDistance, maxDistance }) => {
        const result = findRoute(origin, destination);

        expect(result).toBeDefined();
        expect(result.route).toBeDefined();
        expect(result.route.type).toBe('LineString');
        expect(result.route.coordinates).toBeDefined();
        expect(result.route.coordinates.length).toBeGreaterThan(0);
        expect(result.distance).toBeGreaterThan(0);
        expect(result.waypoints).toBeGreaterThan(0);

        // Expected distance within specified range
        expect(result.distance).toBeGreaterThan(minDistance);
        expect(result.distance).toBeLessThan(maxDistance);
      }
    );

    it('should return route with valid GeoJSON structure', () => {
      const origin = {
        lat: 50.79996296930812,
        lon: -1.1140555835574875,
      };
      const destination = {
        lat: 50.662867292391944,
        lon: -1.6090346985522723,
      };

      const result = findRoute(origin, destination);

      expect(result.route.type).toBe('LineString');
      expect(Array.isArray(result.route.coordinates)).toBe(true);
      expect(result.route.coordinates.length).toBeGreaterThan(0);

      // Check coordinate format [lon, lat]
      for (const coord of result.route.coordinates) {
        expect(Array.isArray(coord)).toBe(true);
        expect(coord.length).toBe(2);
        expect(typeof coord[0]).toBe('number'); // longitude
        expect(typeof coord[1]).toBe('number'); // latitude
      }
    });

    it('should handle same origin and destination', () => {
      const point = {
        lat: 50.79996296930812,
        lon: -1.1140555835574875,
      };

      const result = findRoute(point, point);

      expect(result.distance).toBe(0);
      expect(result.waypoints).toBe(1);
      expect(result.route.coordinates.length).toBe(1);
    });

    it('should handle coordinates far from graph nodes', () => {
      // Use coordinates that are very far from any graph nodes
      // The algorithm will find nearest nodes, but the route might be very long
      const origin = {
        lat: 90, // North pole
        lon: 0,
      };
      const destination = {
        lat: -90, // South pole
        lon: 0,
      };

      // This might find a route through the graph, or throw if truly unreachable
      // We just verify it doesn't crash
      try {
        const result = findRoute(origin, destination);
        expect(result).toBeDefined();
        expect(result.distance).toBeGreaterThanOrEqual(0);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('findDistance', () => {
    it.each(routeTestCases)(
      'should return distance for $description',
      ({ origin, destination, minDistance, maxDistance }) => {
        const distance = findDistance(origin, destination);

        expect(distance).toBeGreaterThan(0);
        // Expected distance within specified range
        expect(distance).toBeGreaterThan(minDistance);
        expect(distance).toBeLessThan(maxDistance);
      }
    );

    it('should return 0 for same origin and destination', () => {
      const point = {
        lat: 50.79996296930812,
        lon: -1.1140555835574875,
      };

      const distance = findDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should match distance from findRoute', () => {
      const origin = {
        lat: 50.79996296930812,
        lon: -1.1140555835574875,
      };
      const destination = {
        lat: 50.662867292391944,
        lon: -1.6090346985522723,
      };

      const routeResult = findRoute(origin, destination);
      const distanceOnly = findDistance(origin, destination);

      expect(distanceOnly).toBe(routeResult.distance);
    });
  });
});

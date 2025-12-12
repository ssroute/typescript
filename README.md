# @ssroute/typescript

TypeScript package for finding shortest maritime routes between two geographic points using the A* pathfinding algorithm on Eurostat SeaRoute / MARNET graph data.

## Installation

```bash
npm install @ssroute/typescript
```

## Usage

### Find Route

Get the complete route between two points:

```typescript
import { findRoute } from '@ssroute/typescript';

const result = findRoute(
  { lat: 50.79996296930812, lon: -1.1140555835574875 },
  { lat: 50.662867292391944, lon: -1.6090346985522723 }
);

console.log(`Distance: ${result.distance} nm`);
console.log(`Waypoints: ${result.waypoints}`);
console.log(`Route:`, result.route); // GeoJSON LineString
```

### Find Distance Only

Get just the distance without the full route:

```typescript
import { findDistance } from '@ssroute/typescript';

const distance = findDistance(
  { lat: 50.79996296930812, lon: -1.1140555835574875 },
  { lat: 50.662867292391944, lon: -1.6090346985522723 }
);

console.log(`Distance: ${distance} nm`);
```

## Coordinate System

All coordinates must be in **WGS84/EPSG:4326** format:
- **Latitude (lat)**: -90 to 90 degrees (decimal degrees)
- **Longitude (lon)**: -180 to 180 degrees (decimal degrees)

Distance calculations use the WGS84 Earth equatorial radius (6,378,137 meters = 3,443.918 nautical miles).

## API

### `findRoute(origin: Point, destination: Point): RouteResult`

Finds the shortest route between two geographic points.

**Parameters:**
- `origin`: Starting point with `lat` (latitude) and `lon` (longitude) in decimal degrees (WGS84/EPSG:4326)
- `destination`: Ending point with `lat` (latitude) and `lon` (longitude) in decimal degrees (WGS84/EPSG:4326)

**Returns:**
- `route`: GeoJSON LineString representing the route path
- `distance`: Total distance in nautical miles
- `waypoints`: Number of nodes (waypoints) in the route

**Throws:**
- `Error` if origin or destination cannot be mapped to graph nodes
- `Error` if no route can be found between the points

### `findDistance(origin: Point, destination: Point): number`

Finds the shortest distance between two geographic points without returning the full route.

**Parameters:**
- `origin`: Starting point with `lat` (latitude) and `lon` (longitude) in decimal degrees (WGS84/EPSG:4326)
- `destination`: Ending point with `lat` (latitude) and `lon` (longitude) in decimal degrees (WGS84/EPSG:4326)

**Returns:**
- Distance in nautical miles

**Throws:**
- `Error` if origin or destination cannot be mapped to graph nodes
- `Error` if no route can be found between the points

### Types

```typescript
interface Point {
  lat: number;
  lon: number;
}

interface RouteResult {
  route: GeoJSON.LineString;
  distance: number; // nautical miles
  waypoints: number;
}
```

## Algorithm

This package uses the **A\* pathfinding algorithm** to find optimal routes:

- **G-cost**: Actual distance traveled from the start node
- **H-cost**: Heuristic estimate (Haversine distance) to the destination
- **F-cost**: G + H (used for priority queue ordering)

The algorithm finds the nearest graph nodes to the input coordinates using the Haversine formula with WGS84 Earth radius, then searches for the shortest path through the maritime routing graph. The Haversine formula provides a spherical approximation of Earth's surface, which is suitable for maritime routing applications.

## Data Source

This package uses graph data from [`@ssroute/data-eurostat`](https://www.npmjs.com/package/@ssroute/data-eurostat), which contains Eurostat SeaRoute / MARNET maritime routing graph data in JSON tuple format.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## License

EUPL-1.2 - See [LICENSE](LICENSE) for details.


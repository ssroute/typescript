import { Point, RouteResult } from './types';
import { Graph } from './graph';
import { findNearestNode } from './nearest-node';
import { haversineDistance } from './heuristics';

/**
 * Priority queue entry for A* algorithm
 */
interface PriorityQueueEntry {
  nodeId: number;
  fCost: number;
  gCost: number;
}

/**
 * A* pathfinding result
 */
interface AStarResult {
  path: number[];
  distance: number;
}

/**
 * Find the shortest route between two points using A* algorithm
 *
 * @param graph - The graph to search in
 * @param origin - Starting point
 * @param destination - Ending point
 * @returns Route result with GeoJSON LineString, distance, and waypoint count
 * @throws Error if origin or destination cannot be mapped to graph nodes
 */
export function findRoute(graph: Graph, origin: Point, destination: Point): RouteResult {
  const startNode = findNearestNode(graph, origin);
  const endNode = findNearestNode(graph, destination);

  if (!startNode || !endNode) {
    throw new Error('Could not find nearest nodes for origin or destination');
  }

  if (startNode.id === endNode.id) {
    // Same node - return trivial route
    return {
      route: {
        type: 'LineString',
        coordinates: [[startNode.lon, startNode.lat]],
      },
      distance: 0,
      waypoints: 1,
    };
  }

  const aStarResult = aStar(graph, startNode.id, endNode.id);

  if (aStarResult.path.length === 0) {
    throw new Error('No route found between origin and destination');
  }

  // Convert path to GeoJSON LineString
  const coordinates: [number, number][] = aStarResult.path.map((nodeId) => {
    const node = graph.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found in graph`);
    }
    return [node.lon, node.lat];
  });

  return {
    route: {
      type: 'LineString',
      coordinates,
    },
    distance: aStarResult.distance,
    waypoints: aStarResult.path.length,
  };
}

/**
 * A* pathfinding algorithm implementation
 *
 * @param graph - The graph to search in
 * @param startId - Starting node ID
 * @param goalId - Goal node ID
 * @returns Path as array of node IDs and total distance
 */
function aStar(graph: Graph, startId: number, goalId: number): AStarResult {
  const goalNode = graph.getNode(goalId);
  if (!goalNode) {
    throw new Error(`Goal node ${goalId} not found`);
  }

  // Open set: nodes to be evaluated (priority queue)
  const openSet: PriorityQueueEntry[] = [{ nodeId: startId, fCost: 0, gCost: 0 }];

  // Closed set: nodes already evaluated
  const closedSet = new Set<number>();

  // G-cost: actual distance from start to each node
  const gCost = new Map<number, number>();
  gCost.set(startId, 0);

  // Parent map for path reconstruction
  const parent = new Map<number, number>();

  while (openSet.length > 0) {
    // Get node with lowest f-cost
    openSet.sort((a, b) => a.fCost - b.fCost);
    const current = openSet.shift()!;

    if (current.nodeId === goalId) {
      // Reconstruct path
      const path: number[] = [];
      let nodeId: number | undefined = goalId;
      while (nodeId !== undefined) {
        path.unshift(nodeId);
        nodeId = parent.get(nodeId);
      }

      // Calculate total distance
      let totalDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const neighbors = graph.getNeighbors(path[i]);
        const nextNodeId = path[i + 1];
        const edge = neighbors.find((n) => n.nodeId === nextNodeId);
        if (edge) {
          totalDistance += edge.distance;
        }
      }

      return { path, distance: totalDistance };
    }

    closedSet.add(current.nodeId);

    // Check all neighbors
    const neighbors = graph.getNeighbors(current.nodeId);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.nodeId)) {
        continue;
      }

      const tentativeGCost = current.gCost + neighbor.distance;

      // Check if this path to neighbor is better
      const existingGCost = gCost.get(neighbor.nodeId);
      if (existingGCost === undefined || tentativeGCost < existingGCost) {
        parent.set(neighbor.nodeId, current.nodeId);
        gCost.set(neighbor.nodeId, tentativeGCost);

        // Calculate heuristic (H-cost)
        const neighborNode = graph.getNode(neighbor.nodeId);
        if (!neighborNode) {
          continue;
        }
        const hCost = haversineDistance(neighborNode, goalNode);
        const fCost = tentativeGCost + hCost;

        // Add to open set if not already there, or update if better
        const existingIndex = openSet.findIndex((e) => e.nodeId === neighbor.nodeId);
        if (existingIndex === -1) {
          openSet.push({ nodeId: neighbor.nodeId, fCost, gCost: tentativeGCost });
        } else if (fCost < openSet[existingIndex].fCost) {
          openSet[existingIndex] = { nodeId: neighbor.nodeId, fCost, gCost: tentativeGCost };
        }
      }
    }
  }

  // No path found
  return { path: [], distance: 0 };
}

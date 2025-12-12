import { Point, GraphNode } from './types';
import { Graph } from './graph';
import { haversineDistance } from './heuristics';

/**
 * Find the nearest node in the graph to the given coordinates
 * Uses spatial index for fast lookup with linear search fallback
 *
 * @param graph - The graph to search in
 * @param point - Target coordinates
 * @returns The nearest graph node, or undefined if graph is empty
 */
export function findNearestNode(graph: Graph, point: Point): GraphNode | undefined {
  const allNodes = graph.getAllNodes();

  if (allNodes.length === 0) {
    return undefined;
  }

  // Try spatial index first - search nearby grid cells
  let searchRadius = 0;
  const maxSearchRadius = 5; // Maximum grid cells to search in each direction
  
  let candidateNodes: GraphNode[] = [];
  
  // Expand search radius until we find nodes or hit max radius
  while (candidateNodes.length === 0 && searchRadius <= maxSearchRadius) {
    candidateNodes = graph.getNodesNearby(point.lat, point.lon, searchRadius);
    searchRadius++;
  }

  // If spatial index found nodes, search only those
  if (candidateNodes.length > 0) {
    let nearestNode: GraphNode = candidateNodes[0];
    let minDistance = haversineDistance(point, nearestNode);

    for (let i = 1; i < candidateNodes.length; i++) {
      const node = candidateNodes[i];
      const distance = haversineDistance(point, node);

      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    }

    return nearestNode;
  }

  // Fallback to linear search if spatial index didn't find nodes
  // This handles edge cases where the point is outside the graph bounds
  let nearestNode: GraphNode = allNodes[0];
  let minDistance = haversineDistance(point, nearestNode);

  for (let i = 1; i < allNodes.length; i++) {
    const node = allNodes[i];
    const distance = haversineDistance(point, node);

    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = node;
    }
  }

  return nearestNode;
}

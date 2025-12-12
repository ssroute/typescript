import { Point, GraphNode } from './types';
import { Graph } from './graph';
import { haversineDistance } from './heuristics';

/**
 * Find the nearest node in the graph to the given coordinates
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

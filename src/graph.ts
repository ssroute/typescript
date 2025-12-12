import { getNodes, getEdges } from '@ssroute/data-eurostat';
import { GraphNode, AdjacencyEntry } from './types';

/**
 * Graph data structure for maritime routing
 */
export class Graph {
  private nodes: Map<number, GraphNode>;
  private adjacencyList: Map<number, AdjacencyEntry[]>;
  private nodesArray: GraphNode[];

  /**
   * Load graph data from @ssroute/data-eurostat and build adjacency list
   */
  constructor() {
    const nodesData = getNodes();
    const edgesData = getEdges();

    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.nodesArray = [];

    // Load nodes - data is an array of [id, lon, lat]
    if (Array.isArray(nodesData)) {
      for (const nodeData of nodesData) {
        if (Array.isArray(nodeData) && nodeData.length >= 3) {
          const [id, lon, lat] = nodeData as [number, number, number];
          const node: GraphNode = {
            id,
            lat,
            lon,
          };
          this.nodes.set(id, node);
          this.nodesArray.push(node);
        }
      }
    }

    // Build adjacency list from edges - data is an array of [from, to, length_nm]
    // Make graph bidirectional by adding edges in both directions
    if (Array.isArray(edgesData)) {
      for (const edgeData of edgesData) {
        if (Array.isArray(edgeData) && edgeData.length >= 3) {
          const [from, to, length_nm] = edgeData as [number, number, number];
          const fromId = from;
          const toId = to;
          const distance = length_nm;

          // Add edge from -> to
          if (!this.adjacencyList.has(fromId)) {
            this.adjacencyList.set(fromId, []);
          }
          this.adjacencyList.get(fromId)!.push({
            nodeId: toId,
            distance,
          });

          // Add reverse edge to -> from (bidirectional graph)
          if (!this.adjacencyList.has(toId)) {
            this.adjacencyList.set(toId, []);
          }
          this.adjacencyList.get(toId)!.push({
            nodeId: fromId,
            distance,
          });
        }
      }
    }
  }

  /**
   * Get a node by its ID
   *
   * @param nodeId - Node ID
   * @returns GraphNode or undefined if not found
   */
  getNode(nodeId: number): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes as an array
   *
   * @returns Array of all nodes
   */
  getAllNodes(): GraphNode[] {
    return this.nodesArray;
  }

  /**
   * Get neighbors of a node
   *
   * @param nodeId - Node ID
   * @returns Array of adjacency entries (neighbor node ID and distance)
   */
  getNeighbors(nodeId: number): AdjacencyEntry[] {
    return this.adjacencyList.get(nodeId) || [];
  }
}

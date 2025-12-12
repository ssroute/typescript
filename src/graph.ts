import { getNodes, getEdges } from '@ssroute/data-eurostat';
import { GraphNode, AdjacencyEntry } from './types';

/**
 * Grid cell key for spatial hash
 */
type GridKey = string;

/**
 * Graph data structure for maritime routing
 */
export class Graph {
  private nodes: Map<number, GraphNode>;
  private adjacencyList: Map<number, AdjacencyEntry[]>;
  private nodesArray: GraphNode[];
  private spatialGrid: Map<GridKey, GraphNode[]>;
  private gridResolution: number;
  private minLat: number;
  private maxLat: number;
  private minLon: number;
  private maxLon: number;

  /**
   * Load graph data from @ssroute/data-eurostat and build adjacency list
   * 
   * Graph nodes are expected to be in WGS84/EPSG:4326 coordinate system.
   */
  constructor() {
    const nodesData = getNodes();
    const edgesData = getEdges();

    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.nodesArray = [];
    this.spatialGrid = new Map();
    
    // Initialize bounds
    this.minLat = Infinity;
    this.maxLat = -Infinity;
    this.minLon = Infinity;
    this.maxLon = -Infinity;

    // Load nodes - data is an array of [id, lon, lat] in WGS84/EPSG:4326
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
          
          // Update bounds
          this.minLat = Math.min(this.minLat, lat);
          this.maxLat = Math.max(this.maxLat, lat);
          this.minLon = Math.min(this.minLon, lon);
          this.maxLon = Math.max(this.maxLon, lon);
        }
      }
    }

    // Calculate grid resolution based on node count
    // Aim for roughly 10-50 nodes per cell on average
    const nodeCount = this.nodesArray.length;
    const targetNodesPerCell = 20;
    const totalCells = Math.ceil(nodeCount / targetNodesPerCell);
    const gridSize = Math.ceil(Math.sqrt(totalCells));
    this.gridResolution = gridSize;
    
    // Build spatial grid
    this.buildSpatialGrid();

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

  /**
   * Get nodes in nearby grid cells for spatial queries
   *
   * @param lat - Latitude
   * @param lon - Longitude
   * @param searchRadius - Number of grid cells to search in each direction (default: 1)
   * @returns Array of nodes in nearby grid cells
   */
  getNodesNearby(lat: number, lon: number, searchRadius: number = 1): GraphNode[] {
    const gridLat = this.latToGrid(lat);
    const gridLon = this.lonToGrid(lon);
    const nodes: GraphNode[] = [];

    // Search nearby grid cells
    for (let dLat = -searchRadius; dLat <= searchRadius; dLat++) {
      for (let dLon = -searchRadius; dLon <= searchRadius; dLon++) {
        const key = this.gridKey(gridLat + dLat, gridLon + dLon);
        const cellNodes = this.spatialGrid.get(key);
        if (cellNodes) {
          nodes.push(...cellNodes);
        }
      }
    }

    return nodes;
  }

  /**
   * Build spatial grid index from all nodes
   */
  private buildSpatialGrid(): void {
    this.spatialGrid.clear();

    for (const node of this.nodesArray) {
      const gridLat = this.latToGrid(node.lat);
      const gridLon = this.lonToGrid(node.lon);
      const key = this.gridKey(gridLat, gridLon);

      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      this.spatialGrid.get(key)!.push(node);
    }
  }

  /**
   * Convert latitude to grid coordinate
   *
   * @param lat - Latitude
   * @returns Grid latitude coordinate
   */
  private latToGrid(lat: number): number {
    const latRange = this.maxLat - this.minLat;
    if (latRange === 0) return 0;
    const normalized = (lat - this.minLat) / latRange;
    return Math.floor(normalized * this.gridResolution);
  }

  /**
   * Convert longitude to grid coordinate
   *
   * @param lon - Longitude
   * @returns Grid longitude coordinate
   */
  private lonToGrid(lon: number): number {
    const lonRange = this.maxLon - this.minLon;
    if (lonRange === 0) return 0;
    const normalized = (lon - this.minLon) / lonRange;
    return Math.floor(normalized * this.gridResolution);
  }

  /**
   * Create grid key from grid coordinates
   *
   * @param gridLat - Grid latitude
   * @param gridLon - Grid longitude
   * @returns Grid key string
   */
  private gridKey(gridLat: number, gridLon: number): GridKey {
    return `${gridLat},${gridLon}`;
  }
}

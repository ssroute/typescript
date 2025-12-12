/**
 * Priority queue entry for A* algorithm
 */
export interface PriorityQueueEntry {
  nodeId: number;
  fCost: number;
  gCost: number;
}

/**
 * Binary min-heap priority queue for A* pathfinding
 * Maintains entries sorted by fCost (lowest first)
 */
export class PriorityQueue {
  private heap: PriorityQueueEntry[];
  private nodeIdToIndex: Map<number, number>;

  constructor() {
    this.heap = [];
    this.nodeIdToIndex = new Map();
  }

  /**
   * Add an entry to the priority queue
   *
   * @param entry - Entry to add
   */
  push(entry: PriorityQueueEntry): void {
    // If node already exists, update it instead
    if (this.nodeIdToIndex.has(entry.nodeId)) {
      this.update(entry.nodeId, entry.fCost, entry.gCost);
      return;
    }

    // Add to end of heap
    this.heap.push(entry);
    const index = this.heap.length - 1;
    this.nodeIdToIndex.set(entry.nodeId, index);

    // Bubble up to maintain heap property
    this.bubbleUp(index);
  }

  /**
   * Remove and return the entry with the lowest fCost
   *
   * @returns Entry with lowest fCost, or undefined if empty
   */
  pop(): PriorityQueueEntry | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      const entry = this.heap.pop()!;
      this.nodeIdToIndex.delete(entry.nodeId);
      return entry;
    }

    // Swap root with last element
    const root = this.heap[0];
    const last = this.heap.pop()!;
    this.heap[0] = last;
    this.nodeIdToIndex.set(last.nodeId, 0);
    this.nodeIdToIndex.delete(root.nodeId);

    // Bubble down to maintain heap property
    this.bubbleDown(0);

    return root;
  }

  /**
   * Peek at the entry with the lowest fCost without removing it
   *
   * @returns Entry with lowest fCost, or undefined if empty
   */
  peek(): PriorityQueueEntry | undefined {
    return this.heap[0];
  }

  /**
   * Update an existing entry's costs
   *
   * @param nodeId - Node ID to update
   * @param newFCost - New f-cost
   * @param newGCost - New g-cost
   * @returns true if entry was found and updated, false otherwise
   */
  update(nodeId: number, newFCost: number, newGCost: number): boolean {
    const index = this.nodeIdToIndex.get(nodeId);
    if (index === undefined) {
      return false;
    }

    const oldFCost = this.heap[index].fCost;
    this.heap[index].fCost = newFCost;
    this.heap[index].gCost = newGCost;

    // If fCost decreased, bubble up; if increased, bubble down
    if (newFCost < oldFCost) {
      this.bubbleUp(index);
    } else if (newFCost > oldFCost) {
      this.bubbleDown(index);
    }

    return true;
  }

  /**
   * Check if a node ID exists in the queue
   *
   * @param nodeId - Node ID to check
   * @returns true if node exists in queue
   */
  has(nodeId: number): boolean {
    return this.nodeIdToIndex.has(nodeId);
  }

  /**
   * Check if the queue is empty
   *
   * @returns true if queue is empty
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Bubble up an element to maintain min-heap property
   *
   * @param index - Index to bubble up from
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].fCost >= this.heap[parentIndex].fCost) {
        break;
      }

      // Swap with parent
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Bubble down an element to maintain min-heap property
   *
   * @param index - Index to bubble down from
   */
  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < this.heap.length && this.heap[leftChild].fCost < this.heap[smallest].fCost) {
        smallest = leftChild;
      }

      if (rightChild < this.heap.length && this.heap[rightChild].fCost < this.heap[smallest].fCost) {
        smallest = rightChild;
      }

      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  /**
   * Swap two elements in the heap and update index map
   *
   * @param i - First index
   * @param j - Second index
   */
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;

    this.nodeIdToIndex.set(this.heap[i].nodeId, i);
    this.nodeIdToIndex.set(this.heap[j].nodeId, j);
  }
}


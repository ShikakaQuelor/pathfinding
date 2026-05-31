import { MinHeap } from './MinHeap';
import { getUnvisitedNeighbors } from './utility';
import type { GridNode, Grid } from '../types';

export function dijkstra(
  grid: Grid,
  startNode: GridNode,
  endNode: GridNode,
): GridNode[] {
  const visitedNodesInOrder: GridNode[] = [];
  startNode.distance = 0;

  const heap = new MinHeap<GridNode>((a, b) => a.distance - b.distance);
  heap.push(startNode);

  while (heap.size > 0) {
    const closestNode = heap.pop()!;

    // Skip if already processed (stale heap entry) or a wall
    if (closestNode.isVisited) continue;
    if (closestNode.isWall && !closestNode.isStart && !closestNode.isEnd) continue;
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode.row === endNode.row && closestNode.col === endNode.col)
      return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(closestNode, grid)) {
      const newDist = closestNode.distance + 1;
      if (newDist < neighbor.distance) {
        neighbor.distance = newDist;
        neighbor.previousNode = closestNode;
        heap.push(neighbor); // push updated entry; stale entries are skipped above
      }
    }
  }

  return visitedNodesInOrder;
}

import { MinHeap } from './MinHeap';
import { getUnvisitedNeighbors } from './utility';
import type { GridNode, Grid } from '../types';

function manhattanDistance(a: GridNode, b: GridNode): number {
  return Math.abs(b.row - a.row) + Math.abs(b.col - a.col);
}

export function astar(
  grid: Grid,
  startNode: GridNode,
  endNode: GridNode,
): GridNode[] {
  const visitedNodesInOrder: GridNode[] = [];

  startNode.distance = 0;
  startNode.f = manhattanDistance(startNode, endNode);

  const heap = new MinHeap<GridNode>((a, b) => a.f - b.f);
  heap.push(startNode);

  while (heap.size > 0) {
    const current = heap.pop()!;

    // Skip stale heap entries
    if (current.isVisited) continue;
    if (current.isWall && !current.isStart && !current.isEnd) continue;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col)
      return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(current, grid)) {
      if (neighbor.isWall && !neighbor.isEnd) continue;

      const gScore = current.distance + 1;
      if (gScore < neighbor.distance) {
        neighbor.previousNode = current;
        neighbor.distance = gScore;
        neighbor.f = gScore + manhattanDistance(neighbor, endNode);
        heap.push(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}

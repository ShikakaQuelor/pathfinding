import type { GridNode, Grid } from '../types';

export function getNodesShortestPath(endNode: GridNode): GridNode[] {
  const nodesShortestPath: GridNode[] = [];
  let currentNode: GridNode | null = endNode;
  while (currentNode !== null) {
    nodesShortestPath.unshift(currentNode);
    currentNode.isShortest = true;
    currentNode = currentNode.previousNode;
  }
  return nodesShortestPath;
}

export function getUnvisitedNeighbors(node: GridNode, grid: Grid): GridNode[] {
  const neighbors: GridNode[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isVisited);
}

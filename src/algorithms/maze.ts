import type { GridNode, Grid } from '../types';

export function dfsMaze(grid: Grid, startNode: GridNode): void {
  wallGrid(grid);
  let frontCells = getFrontierNodes(startNode, grid, true);

  while (frontCells.length > 0) {
    const currentNode =
      frontCells[Math.round(Math.random() * (frontCells.length - 1))];

    const neighbors = getFrontierNodes(currentNode, grid, false);
    if (neighbors.length === 0) {
      frontCells = frontCells.filter((n) => n !== currentNode);
      continue;
    }

    const rndNeighbor =
      neighbors[Math.round(Math.random() * (neighbors.length - 1))];

    const midRow = (currentNode.row + rndNeighbor.row) / 2;
    const midCol = (currentNode.col + rndNeighbor.col) / 2;

    grid[midRow][midCol].isWall = false;
    currentNode.isWall = false;

    getFrontierNodes(currentNode, grid, true).forEach((node) => {
      frontCells.push(node);
    });

    frontCells = frontCells.filter((node) => node.isWall === true);
  }
}

function wallGrid(grid: Grid): void {
  for (const row of grid) {
    for (const node of row) {
      if (node.isStart) continue; // end node is walled — maze carves to it naturally
      node.isWall = true;
    }
  }
}

function getFrontierNodes(
  node: GridNode,
  grid: Grid,
  wall: boolean,
): GridNode[] {
  const frontier: GridNode[] = [];
  const { col, row } = node;
  if (row > 1) frontier.push(grid[row - 2][col]);
  if (row < grid.length - 2) frontier.push(grid[row + 2][col]);
  if (col > 1) frontier.push(grid[row][col - 2]);
  if (col < grid[0].length - 2) frontier.push(grid[row][col + 2]);
  return frontier.filter((n) => n.isWall === wall);
}

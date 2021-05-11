export function dfsMaze(grid, startNode) {
  wallGrid(grid);
  let frontCells = getFrontierNodes(startNode, grid, true);

  // eslint-disable-next-line no-extra-boolean-cast
  while (!!frontCells.length) {
    const currentNode =
      frontCells[Math.round(Math.random() * (frontCells.length - 1))];

    const neighbors = getFrontierNodes(currentNode, grid, false);
    const rndNeighbor =
      neighbors[Math.round(Math.random() * (neighbors.length - 1))];

    let x = (currentNode.row + rndNeighbor.row) / 2;
    let y = (currentNode.col + rndNeighbor.col) / 2;

    const newNode = grid[x][y];
    newNode.isWall = false;
    currentNode.isWall = false;

    getFrontierNodes(currentNode, grid, true).forEach((node) => {
      frontCells.push(node);
    });

    frontCells = frontCells.filter((node) => node.isWall == true);
  }

  function wallGrid(grid) {
    for (const row of grid) {
      for (const node of row) {
        if (node.isStart) continue;
        node.isWall = true;
      }
    }
  }

  function getFrontierNodes(node, grid, wall) {
    const frontier = [];
    const { col, row } = node;
    if (row > 1) frontier.push(grid[row - 2][col]);
    if (row < grid.length - 2) frontier.push(grid[row + 2][col]);
    if (col > 1) frontier.push(grid[row][col - 2]);
    if (col < grid[1].length - 2) frontier.push(grid[row][col + 2]);
    return frontier.filter((frontier) => frontier.isWall == wall);
  }
}

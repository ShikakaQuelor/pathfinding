export function getNodesShortestPath(endNode) {
  const nodesShortestPath = [];
  let currentNode = endNode;
  while (currentNode != null) {
    nodesShortestPath.unshift(currentNode);
    currentNode.isShortest = true;
    currentNode = currentNode.previousNode;
  }
  return nodesShortestPath;
}

export function getUnvisitedNeighbors(node, grid) {
  const neighbor = [];
  const { col, row } = node;
  if (row > 0) neighbor.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbor.push(grid[row + 1][col]);
  if (col > 0) neighbor.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbor.push(grid[row][col + 1]);
  return neighbor.filter((neighbor) => !neighbor.isVisited);
}

export function sortNodeByFScore(nodes) {
  nodes.sort((nodeA, nodeB) => nodeA.f - nodeB.f);
}

export function sortNodeByDistance(nodes) {
  nodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

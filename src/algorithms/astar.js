import { sortNodeByFScore, getUnvisitedNeighbors } from "./utility";

export function astar(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const openList = [];
  startNode.distance = 0;
  startNode.f = manhattanDistance(startNode, endNode);

  openList.push(startNode);

  // eslint-disable-next-line no-extra-boolean-cast
  while (!!openList.length) {
    sortNodeByFScore(openList);
    const currentNode = openList.shift();

    if (currentNode.row === endNode.row && currentNode.col === endNode.col)
      return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(currentNode, grid);

    for (const neighbor of neighbors) {
      if (neighbor.isWall && !neighbor.isEnd) continue;
      visitedNodesInOrder.push(neighbor);
      const gScore = currentNode.distance + 1;
      if (gScore < neighbor.distance) {
        neighbor.previousNode = currentNode;
        neighbor.distance = gScore;
        neighbor.f = neighbor.distance + manhattanDistance(neighbor, endNode);

        if (!neighbor.isVisited) {
          neighbor.isVisited = true;
          openList.push(neighbor);
        }
      }
    }
  }
  return visitedNodesInOrder;
}

function manhattanDistance(a, b) {
  const d1 = Math.abs(b.row - a.row);
  const d2 = Math.abs(b.col - a.col);
  return d1 + d2;
}

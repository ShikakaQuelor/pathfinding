<template>
  <div class="title">
    <h1>PATHFINDER</h1>
  </div>
  <div class="howto">
    <span>HOW TO:</span> Click and hold anywhere on the grid to apply/remove a
    wall node. <br />
    To move starting/end position drag'n'drop the pin to an empty grid location.
    <br /><br />
    When you are satisfied with a maze, select an algorithm and click the
    "Solve" button. You also have the choice of generating a maze.
    <br /><br />
    The toolbar on the left is movable by dragging.
  </div>
  <Toolbar
    @solve-click="solvePath"
    @reset-click="resetAll"
    @maze-click="genMaze"
    @autoupdate-click="(e: boolean) => (autoUpdate = e)"
    @get-speed="(e: number) => (animSpeed = e)"
    @get-algo="(e: number) => (algorithm = e)"
  />
  <div class="grid" @mouseup="handleMouseUp">
    <template v-for="(row, rid) in grid" :key="rid">
      <template v-for="(node, cid) in row" :key="cid">
        <Node
          :row="node.row"
          :col="node.col"
          :isStart="node.isStart"
          :isWall="node.isWall"
          :isEnd="node.isEnd"
          :isVisited="node.isVisited"
          :isShortest="node.isShortest"
          @mouse-down="handleMouseDown"
          @mouse-enter="handleMouseEnter"
          @mouse-leave="handleMouseLeave"
        />
      </template>
    </template>
  </div>
  <div class="credits">Made by Johan Hultin</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import Node from './Node.vue';
import Toolbar from './Toolbar.vue';
import { getNodesShortestPath } from '../algorithms/utility';
import { dijkstra } from '../algorithms/dijkstras';
import { astar } from '../algorithms/astar';
import { dfsMaze } from '../algorithms/maze';
import type { GridNode, Grid } from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROWS = 31;
const COLS = 71;
const NODE_START_ROW = 15;
const NODE_START_COL = 15;
const NODE_END_ROW = 15;
const NODE_END_COL = 55;

const algorithms = [dijkstra, astar];

// ─── State ───────────────────────────────────────────────────────────────────

const grid = ref<Grid>(getInitialGrid());

// Track start/end positions directly — avoids O(n) full-grid scans
const startPos = reactive({ row: NODE_START_ROW, col: NODE_START_COL });
const endPos = reactive({ row: NODE_END_ROW, col: NODE_END_COL });

const mouseWall = ref(false);
const mouseStart = ref(false);
const mouseEnd = ref(false);
const erase = ref(false);
const animSpeed = ref(10);
const algorithm = ref(0);
const autoUpdate = ref(false);

// Single animation handle — only one interval ever runs at a time
const animHandle = ref<ReturnType<typeof setInterval> | null>(null);

// ─── Grid construction ───────────────────────────────────────────────────────

function createNode(row: number, col: number): GridNode {
  return {
    row,
    col,
    isStart: row === NODE_START_ROW && col === NODE_START_COL,
    isEnd: row === NODE_END_ROW && col === NODE_END_COL,
    isWall: false,
    isVisited: false,
    isShortest: false,
    previousNode: null,
    distance: Infinity,
    f: Infinity,
  };
}

function getInitialGrid(): Grid {
  const g: Grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow: GridNode[] = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(row, col));
    }
    g.push(currentRow);
  }
  return g;
}

// ─── Mouse handlers ──────────────────────────────────────────────────────────

function handleMouseDown(row: number, col: number): void {
  const node = grid.value[row][col];
  if (node.isStart) {
    mouseStart.value = true;
    return;
  }
  if (node.isEnd) {
    mouseEnd.value = true;
    return;
  }
  mouseWall.value = true;
  // Toggle: if it was a wall, erase it; if open, draw a wall
  erase.value = !node.isWall;
  node.isWall = erase.value;
  if (node.isShortest) updatePath();
}

function handleMouseUp(): void {
  if ((mouseStart.value || mouseEnd.value) && autoUpdate.value) updatePath();
  mouseWall.value = false;
  mouseStart.value = false;
  mouseEnd.value = false;
}

function handleMouseEnter(row: number, col: number): void {
  const node = grid.value[row][col];
  if (mouseStart.value) {
    node.isStart = true;
    startPos.row = row;
    startPos.col = col;
  }
  if (mouseEnd.value) {
    node.isEnd = true;
    endPos.row = row;
    endPos.col = col;
  }
  if (mouseWall.value && !(mouseEnd.value || mouseStart.value)) {
    node.isWall = erase.value;
    if (node.isShortest) updatePath();
  }
}

function handleMouseLeave(row: number, col: number): void {
  const node = grid.value[row][col];
  if (mouseStart.value) {
    node.isStart = false;
    resetPath();
  }
  if (mouseEnd.value) {
    node.isEnd = false;
    resetPath();
  }
}

// ─── Animation ───────────────────────────────────────────────────────────────

// Maps toolbar slider value → { delay in ms, nodes revealed per tick }.
// Decouples the slider range from actual timing so they can be tuned independently.
const SPEED_CONFIG: Record<number, { delay: number; batchSize: number }> = {
  5:  { delay: 8,  batchSize: 5 }, // Very-Fast
  10: { delay: 14, batchSize: 3 }, // Fast
  15: { delay: 22, batchSize: 1 }, // Normal
  20: { delay: 45, batchSize: 1 }, // Slow
  25: { delay: 90, batchSize: 1 }, // Super-slow
};

/**
 * Animate visited nodes using a single setInterval.
 * At speed=0 ("Instant") all nodes are applied synchronously in one pass.
 */
function animatePath(visited: GridNode[], shortest: GridNode[]): void {
  if (animSpeed.value === 0) {
    for (const node of visited) {
      if (!node.isStart && !node.isEnd) node.isVisited = true;
    }
    animateShortest(shortest);
    return;
  }

  const { delay, batchSize } = SPEED_CONFIG[animSpeed.value] ?? { delay: 35, batchSize: 1 };
  let i = 0;
  animHandle.value = setInterval(() => {
    for (let b = 0; b < batchSize; b++) {
      if (i >= visited.length) {
        stopAnimation();
        animateShortest(shortest);
        return;
      }
      const node = visited[i];
      if (!node.isStart && !node.isEnd) node.isVisited = true;
      i++;
    }
  }, delay);
}

function animateShortest(shortest: GridNode[]): void {
  if (animSpeed.value === 0) {
    for (const node of shortest) {
      node.isShortest = true;
    }
    return;
  }

  const { delay } = SPEED_CONFIG[animSpeed.value] ?? { delay: 35 };
  let i = 0;
  // Shortest path always reveals one node at a time at 4× the visited delay
  animHandle.value = setInterval(() => {
    if (i >= shortest.length) {
      stopAnimation();
      return;
    }
    shortest[i].isShortest = true;
    i++;
  }, delay * 4);
}

function stopAnimation(): void {
  if (animHandle.value !== null) {
    clearInterval(animHandle.value);
    animHandle.value = null;
  }
}

// ─── Path logic ──────────────────────────────────────────────────────────────

function getStartNode(): GridNode {
  return grid.value[startPos.row][startPos.col];
}

function getEndNode(): GridNode {
  return grid.value[endPos.row][endPos.col];
}

function getPathResult() {
  const startNode = getStartNode();
  const endNode = getEndNode();
  const visitedNodesInOrder = algorithms[algorithm.value](grid.value, startNode, endNode);
  const nodesInShortestPathOrder = getNodesShortestPath(endNode);
  return { visitedNodesInOrder, nodesInShortestPathOrder };
}

function updatePath(): void {
  if (!autoUpdate.value) return;
  solvePath();
}

function solvePath(): void {
  resetPath();
  const { visitedNodesInOrder, nodesInShortestPathOrder } = getPathResult();

  // The algorithm sets node.isVisited and node.isShortest on the live grid nodes
  // for its own internal tracking. Reset those flags so the animator can drive
  // the visual state step-by-step via Vue reactivity.
  for (const node of visitedNodesInOrder) {
    node.isVisited = false;
  }
  for (const node of nodesInShortestPathOrder) {
    node.isShortest = false;
    node.isVisited = false; // shortest nodes were also marked visited
  }

  animatePath(visitedNodesInOrder, nodesInShortestPathOrder);
}

/**
 * Cancel any running animation and reset all node visited/shortest state.
 * Only clears our own handle — no brute-force global timer sweep.
 */
function resetPath(): void {
  stopAnimation();
  for (const row of grid.value) {
    for (const node of row) {
      node.isVisited = false;
      node.isShortest = false;
      node.previousNode = null;
      node.distance = Infinity;
      node.f = Infinity;
    }
  }
}

function resetAll(): void {
  stopAnimation();
  // Reset start/end tracking positions
  startPos.row = NODE_START_ROW;
  startPos.col = NODE_START_COL;
  endPos.row = NODE_END_ROW;
  endPos.col = NODE_END_COL;
  grid.value = getInitialGrid();
}

function genMaze(): void {
  resetPath();
  dfsMaze(grid.value, getStartNode());
}
</script>

<style lang="scss">
.grid {
  width: 1775px;
  background: white;
  margin: 50px 0 0;
  font-size: 0;
  outline: 2px solid #2c3e50;
}

.row {
  user-select: none;
}

.title {
  margin: 0;
  padding: 0;
  font-size: 3rem;
  font-weight: bold;
}

.credits {
  margin-top: 20px;
}

.howto {
  color: rgb(41, 73, 255);
  font-size: 1.1rem;

  & span {
    font-weight: bold;
    color: #721817;
  }
}

@media only screen and (max-width: 1800px) {
  .grid {
    width: 1420px;
  }
}
</style>

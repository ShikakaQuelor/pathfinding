<template>
  <div class="title"><h1>PATHFINDER</h1></div>
  <div class="howto">
    <span>HOW TO:</span>Click and hold anywhere on the grid to apply/remove a
    wall node. <br />
    To move starting/end position drag'n'drop the pin to an empty grid location.
    <br />
    <br />
    When you are satisfied with a maze, select an algorithm and click the
    "Solve" button. You also have the choice of generating a maze.
    <br />
    <br />
    The toolbar on the left is movable by dragging.
  </div>
  <Toolbar
    @solve-click="solvePath"
    @reset-click="resetAll"
    @maze-click="genMaze"
    @autoupdate-click="(e) => (autoUpdate = e)"
    @get-speed="(e) => (animSpeed = e)"
    @get-algo="(e) => (algorithm = e)"
  />
  <div class="grid" @mouseup="handleMouseUp">
    <div class="row" v-for="(row, rid) in grid" :key="rid">
      <template v-for="(node, cid) in row" :key="cid">
        <Node
          :row="node.row"
          :col="node.col"
          :isStart="node.isStart"
          :isWall="node.isWall"
          :isEnd="node.isEnd"
          @mouse-down="handleMouseDown"
          @mouse-enter="handleMouseEnter"
          @mouse-leave="handleMouseLeave"
        ></Node>
      </template>
    </div>
  </div>
  <div class="credits">Made by Johan Berglund</div>
</template>

<script>
import { onMounted, reactive, toRefs } from "vue";
import Node from "./Node";
import Toolbar from "./Toolbar";
import { getNodesShortestPath } from "../algorithms/utility";
import { dijkstra } from "../algorithms/dijkstras";
import { astar } from "../algorithms/astar";
import { dfsMaze } from "../algorithms/maze";

export const NODE_START_ROW = 15;
export const NODE_START_COL = 15;
export const NODE_END_ROW = 15;
export const NODE_END_COL = 55;

export const algorithms = [dijkstra, astar];

export default {
  components: {
    Node,
    Toolbar,
  },
  setup() {
    const state = reactive({
      grid: [],
      mouseWall: Boolean,
      mouseStart: Boolean,
      mouseEnd: Boolean,
      animSpeed: Number,
      erase: Boolean,
      algorithm: Number,
      autoUpdate: Boolean,
    });

    onMounted(() => {
      state.grid = getInitialGrid();
      state.mouseWall = false;
      state.mouseStart = false;
      state.mouseEnd = false;
      state.erase = false;
      state.animSpeed = 10;
      state.algorithm = 0;
      state.autoUpdate = false;
    });

    function handleMouseDown(row, col) {
      if (state.grid[row][col].isStart) state.mouseStart = true;
      if (state.grid[row][col].isEnd) state.mouseEnd = true;
      if (!state.mouseEnd && !state.mouseStart) {
        state.mouseWall = true;
        state.erase = !state.grid[row][col].isWall;
        state.grid[row][col].isWall = state.erase;
        if (state.grid[row][col].isShortest) updatePath();
      }
    }

    function handleMouseUp() {
      if ((state.mouseStart || state.mouseEnd) && state.autoUpdate)
        updatePath();
      state.mouseWall = false;
      state.mouseStart = false;
      state.mouseEnd = false;
    }

    function handleMouseEnter(row, col) {
      if (state.mouseStart) state.grid[row][col].isStart = true;
      if (state.mouseEnd) state.grid[row][col].isEnd = true;
      if (state.mouseWall && !(state.mouseEnd || state.mouseStart)) {
        state.grid[row][col].isWall = state.erase;
        if (state.grid[row][col].isShortest) updatePath();
      }
    }

    function handleMouseLeave(row, col) {
      if (state.mouseStart) {
        state.grid[row][col].isStart = false;
        resetPath();
      }
      if (state.mouseEnd) {
        state.grid[row][col].isEnd = false;
        resetPath();
      }
    }

    function animatePath(visitedNodesInOrder, nodesInShortestPathOrder) {
      for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
          setTimeout(() => {
            animatePathShortest(nodesInShortestPathOrder);
          }, state.animSpeed * i);
          return;
        }
        setTimeout(() => {
          const node = visitedNodesInOrder[i];
          let element = document.getElementById(`node-${node.row}-${node.col}`);
          if (
            element.classList.contains("node-start") ||
            element.classList.contains("node-finish")
          )
            return;
          element.className = "node node-visited";
        }, state.animSpeed * i);
      }
    }

    function animatePathShortest(nodesInShortestPathOrder) {
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          let element = document.getElementById(`node-${node.row}-${node.col}`);

          if (element.classList.contains("node-start"))
            element.className = "node node-shortest node-start";
          else if (element.classList.contains("node-finish"))
            element.className = "node node-shortest node-finish";
          else element.className = "node node-shortest";
        }, state.animSpeed * 5 * i);
      }
    }

    function getPathAlgorithm() {
      const { grid } = state;
      const startNode = getStartNode(grid);
      const endNode = getEndNode(grid);
      const visitedNodesInOrder = algorithms[state.algorithm](
        grid,
        startNode,
        endNode
      );
      const nodesInShortestPathOrder = getNodesShortestPath(endNode);
      return { visitedNodesInOrder, nodesInShortestPathOrder };
    }

    function updatePath() {
      if (!state.autoUpdate) return;
      solvePath();
    }

    function solvePath() {
      resetPath();
      const {
        visitedNodesInOrder,
        nodesInShortestPathOrder,
      } = getPathAlgorithm();
      animatePath(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    function resetPath() {
      for (const row of state.grid) {
        for (const node of row) {
          resetNode(node, ["node-shortest", "node-visited"]);
        }
      }
      var id = window.setTimeout(function () {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    }

    function resetAll() {
      state.grid = getInitialGrid();
      resetPath();
    }

    function genMaze() {
      resetPath();
      const startNode = getStartNode(state.grid);
      dfsMaze(state.grid, startNode);
    }

    return {
      handleMouseDown,
      handleMouseUp,
      handleMouseEnter,
      handleMouseLeave,
      solvePath,
      resetAll,
      genMaze,
      ...toRefs(state),
    };
  },
};

const resetNode = (node, classRemove) => {
  node.isVisited = false;
  node.isShortest = false;
  node.previousNode = null;
  node.distance = Infinity;
  node.f = null;
  document
    .getElementById(`node-${node.row}-${node.col}`)
    .classList.remove(...classRemove);
};

const getStartNode = (grid) => {
  for (const row of grid) {
    for (const node of row) {
      if (node.isStart) return node;
    }
  }
};

const getEndNode = (grid) => {
  for (const row of grid) {
    for (const node of row) {
      if (node.isEnd) return node;
    }
  }
};

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 31; row++) {
    const currentRow = [];
    for (let col = 0; col < 71; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (row, col) => {
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
  };
};
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
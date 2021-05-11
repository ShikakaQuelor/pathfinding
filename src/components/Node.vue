<template>
  <div
    :id="`node-${row}-${col}`"
    class="node"
    :class="extraClass"
    @mousedown="$emit('mouse-down', row, col)"
    @mouseenter="$emit('mouse-enter', row, col)"
    @mouseleave="$emit('mouse-leave', row, col)"
  ></div>
</template>

<script>
export default {
  props: {
    row: Number,
    col: Number,
    isStart: Boolean,
    isEnd: Boolean,
    isWall: Boolean,
  },
  computed: {
    extraClass() {
      return this.isEnd
        ? "node-finish"
        : this.isStart
        ? "node-start"
        : this.isWall
        ? "node-wall"
        : "";
    },
  },
};
</script>

<style lang="scss">
.node {
  width: 25px;
  height: 25px;
  display: inline-block;
  outline-offset: -1px;
  outline: 1px solid rgba(41, 73, 255, 0.2);
}

.node-wall {
  outline: none;
  background-color: rgb(8, 34, 46);
  animation: wallAnimation 0.3s ease-in-out forwards;
}

.node-visited {
  outline: 1px dashed rgba(255, 255, 255, 0.1);
  animation: visitedAnimation 1.5s ease-out forwards running;
}

.node-shortest {
  background: rgba(41, 73, 255, 0.75);
  outline: 1px dashed rgba(255, 255, 255, 0.2);
  animation: shortestAnimation 1.5s ease-out forwards running;
}

.node-start {
  background-image: url("../assets/start.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.node-finish {
  background-image: url("../assets/end.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

@keyframes wallAnimation {
  0% {
    transform: scale(0.3);
    border-radius: 50%;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes visitedAnimation {
  0% {
    transform: scale(0.3);
    background-color: rgba(8, 14, 51, 0.75);
    border-radius: 100%;
  }
  25% {
    background-color: rgba(12, 21, 74, 0.75);
  }
  50% {
    background-color: rgba(17, 30, 108, 0.75);
  }
  75% {
    transform: scale(1.2);
    background-color: rgba(25, 45, 161, 0.75);
  }
  100% {
    transform: scale(1);
    background-color: rgba(41, 73, 255, 0.85);
  }
}

@keyframes shortestAnimation {
  0% {
    background-color: #2b4162;
  }
  25% {
    background-color: rgba(21, 74, 12, 0.75);
  }
  50% {
    background-color: rgba(17, 108, 30, 0.75);
  }
  75% {
    transform: scale(1.2);
    background-color: rgba(25, 161, 161, 0.75);
  }
  100% {
    transform: scale(1);
    background-color: #21d4d4;
  }
}
</style>>
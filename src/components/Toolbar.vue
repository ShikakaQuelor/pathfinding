<script setup>
import { ref, reactive } from "vue";

const selectedAlgorithm = ref(0);
const animationSpeed = ref(15);
const isMouseDown = ref(false);
const shouldAutoUpdate = ref(false);

const styleObject = reactive({
  left: '0px',
  top: '0px',
});

const speedName = [
  "Instant",
  "Very-Fast",
  "Fast",
  "Normal",
  "Slow",
  "Super-slow"
];

function moveWindow(e) {
  if (isMouseDown.value) {
    var rect = e.target.getBoundingClientRect();
    styleObject.left = rect.left + e.movementX + 'px';
    styleObject.top = rect.top + e.movementY + 'px';
  }
}

</script>

<template>
  <div class="toolbar" @mousedown.self="isMouseDown = true" @mousemove="moveWindow" @mouseup="isMouseDown = false"
    @mouseout="isMouseDown = false" :style="styleObject">
    <h2>Toolbar</h2>
    <div class="speed-range-wrap"></div>
    Animation speed
    <input class="speed-range" type="range" min="0" max="25" step="5" v-model="animationSpeed"
      @input="$emit('get-speed', animationSpeed)" />
    {{ speedName[animationSpeed / 5] }}
    <select class="algo-selector" v-model="selectedAlgorithm" @change="$emit('get-algo', selectedAlgorithm)">
      <option value="0" selected>Dijkstras</option>
      <option value="1">A*</option>
    </select>
    <button class="maze-button" @click="$emit('maze-click')">
      Generate random maze
    </button>
    <label for="shouldAutoUpdate">Auto-update path</label>
    <input type="checkbox" name="shouldAutoUpdate" v-model="shouldAutoUpdate"
      @change="$emit('autoupdate-click', shouldAutoUpdate)" />
    <div class="button-wrap">
      <button class="solve-button" @click="$emit('solve-click')">Solve</button>
      <button class="reset-button" @click="$emit('reset-click')">Reset</button>
    </div>
  </div>
</template>

<style lang="scss">
.toolbar {
  width: 250px;
  height: 450px;
  z-index: 99999;
  background: #2b41629a;
  position: absolute;
  top: 220px;
  left: 120px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
  justify-content: center;
  user-select: none;
  color: white;
}

button {
  width: 80%;
  height: 32px;
  margin-top: 10px;
  color: white;
  background: none;
  border-radius: 10px;
  border: white solid 1px;

  &:hover {
    background: rgba(0, 27, 179, 0.6);
  }

  &:focus {
    outline: none;
  }
}

.maze-button {
  position: absolute;
  margin-top: 96px;
}

h2 {
  position: absolute;
  border-bottom: 2px solid white;
  top: 22px;
}

.button-wrap {
  position: absolute;
  width: 100%;
  bottom: 22px;
}

.algo-selector {
  margin-top: 22px;
  margin-bottom: 50%;
}

.speed-range {
  background: none;
  width: 80%;
  height: 30px;

  &::-webkit-slider-runnable-track {
    background: white;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    border: 1px solid green;
    border-radius: 2px;
    width: 25px;
    height: 25px;
    background: black;
  }
}
</style>

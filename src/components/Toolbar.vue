<template>
  <div
    class="toolbar"
    @mousedown.self="mouseClick = !mouseClick"
    @mousemove="moveWindow"
    @mouseup="mouseClick = false"
    @mouseout="mouseClick = false"
    :style="styles"
  >
    <h2>Toolbar</h2>
    <div class="speed-range-wrap"></div>
    Animation speed
    <input
      class="speed-range"
      type="range"
      min="0"
      max="25"
      step="5"
      v-model="animationSpeed"
      @input="$emit('get-speed', animationSpeed)"
    />
    {{ speedName[animationSpeed / 5] }}
    <select
      class="algo-selector"
      v-model="algorithmNum"
      @change="$emit('get-algo', algorithmNum)"
    >
      <option value="0" selected>Dijkstras</option>
      <option value="1">A*</option>
    </select>
    <button class="maze-button" @click="$emit('maze-click')">
      Generate random maze
    </button>
    <label for="autoupdate">Auto-update path</label>
    <input
      type="checkbox"
      name="autoupdate"
      v-model="autoupdate"
      @change="$emit('autoupdate-click', autoupdate)"
    />
    <div class="button-wrap">
      <button class="solve-button" @click="$emit('solve-click')">Solve</button>
      <button class="reset-button" @click="$emit('reset-click')">Reset</button>
    </div>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from "vue";
export default {
  props: {},
  setup() {
    const state = reactive({
      algorithmNum: 0,
      animationSpeed: 15,
      autoupdate: Boolean,
      mouseClick: false,
      xPos: Number,
      yPos: Number,
      speedName: new Array(
        "Instant",
        "Very-Fast",
        "Fast",
        "Normal",
        "Slow",
        "Super-slow"
      ),
    });

    const styles = computed(() => {
      return {
        left: state.xPos + "px",
        top: state.yPos + "px",
      };
    });

    function moveWindow(e) {
      if (state.mouseClick) {
        var rect = e.target.getBoundingClientRect();
        state.xPos = rect.left + e.movementX;
        state.yPos = rect.top + e.movementY;
      }
    }

    return {
      ...toRefs(state),
      styles,
      moveWindow,
    };
  },
};
</script>

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
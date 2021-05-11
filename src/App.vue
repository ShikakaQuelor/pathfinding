<template>
  <PathViz></PathViz>
</template>

<script>
import PathViz from "./components/PathfindingVisualizer.vue";

export default {
  name: "App",
  components: {
    PathViz,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background: #e0e0e2;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

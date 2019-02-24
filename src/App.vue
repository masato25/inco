<template>
  <div id="app">
    title
    <el-progress :text-inside="true" :stroke-width="18" :percentage="100" status="success"></el-progress>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class App extends Vue {}
  // public mounted() {
  //   // setInterval(() => {
  //   //   this.$electron.ipcRenderer.send('ping')
  //   // }, 1000)

  //   // this.$electron.ipcRenderer.on('pong', (event, data) => {
  //   //   // this.myDataVar = data
  //   //   console.log(data)
  //   // })
  // }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

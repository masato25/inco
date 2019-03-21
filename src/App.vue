<template>
  <div id="app">
    <el-progress :text-inside="true" :stroke-width="18" :percentage=progress :status=status></el-progress>
    <p style="overflow: scroll;">{{title}}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import electron from 'electron';

@Component
export default class App extends Vue {
  public title: string = 'Loading...';
  public progress: number = 0;
  public status: string = '';

  public mounted() {
    electron.ipcRenderer.on('progress', (event: any, message: number) => {
      this.progress = Math.floor(message * 100);
      if (message === 1) {
        this.status = 'success';
      }
    });
    electron.ipcRenderer.on('title', (event: any, message: string) => {
      this.title = 'Downloading: ' + message;
    });
  }
}
</script>

<style>
body {
  width: 480px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

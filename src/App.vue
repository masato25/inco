<template>
  <div id="app">
    <p>Downloading ...</p>
    <p style="overflow: scroll;">{{title}}</p>
    <p>size {{progress}} </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import electron from 'electron';

@Component
export default class App extends Vue {
  public title: string = 'Loading...';
  public progress: number | string = 0;
  public status: string = '';

  public mounted() {
    electron.ipcRenderer.on('progress', (event: any, message: string | number) => {
      this.progress = message;
      if (message === 1) {
        this.progress = 'success';
      }
    });
    electron.ipcRenderer.on('title', (event: any, message: string) => {
      this.title = message;
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

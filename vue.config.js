module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        mac: {
          // "asar": true,
          // "asarUnpack": [
          //   "node_modules/@ffmpeg-installer"
          // ],
          icon: 'build/icon.png',
        },
        win: {
          icon: 'build/icon.png',
        }
      }
    }
  }
}

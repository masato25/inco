module.exports = {
  pluginOptions: {
    electronBuilder: {
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: false,
      builderOptions: {
        publish: {
          provider: 'github'
        },
        mac: {
          // "asar": true,
          // "asarUnpack": [
          //   "node_modules/@ffmpeg-installer"
          // ],
          icon: "src/assets/icon.png"
        },
        win: {
          icon: "src/assets/icon.png"
        }
      },
      chainWebpackMainProcess: config => {
        config.plugin("define").tap(args => {
          args[0]["process.env"] = {};
          args[0]["process.env"]["FLUENTFFMPEG_COV"] = false;
          return args;
        });
      }
    }
  }
};

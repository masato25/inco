module.exports = {
  pluginOptions: {
    electronBuilder: {
      disableMainProcessTypescript: false,
      mainProcessTypeChecking: false,
      builderOptions: {
        mac: {
          // "asar": true,
          // "asarUnpack": [
          //   "node_modules/@ffmpeg-installer"
          // ],
          icon: "build/icon.png"
        },
        win: {
          icon: "build/icon.png"
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

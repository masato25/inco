import { app, dialog } from 'electron';
import log from 'electron-log';
// const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static-electron');
const isDevelopment = process.env.NODE_ENV !== 'production';

// TODO windows対応
const generateFfmpegPath = () => {
  if (isDevelopment) {
    return ffmpegStatic.path.replace(
      'dist_electron/bin',
      'dist_electron/mac/inco.app/Contents/Resources/app.asar.unpacked/node_modules/ffmpeg-static-electron/bin',
    );
  }
  return ffmpegStatic.path.replace(
    'app.asar',
    'app.asar.unpacked/node_modules/ffmpeg-static-electron',
  );
};

const ffmpegPath = generateFfmpegPath();
// tempにダウンロード
// app.getPath('temp')
// downloadフォルダに移行
// app.getPath('downloads')
// log.info(app.getPath('exe'));
// log.info(app.getPath('temp'));
// log.info(app.getPath('downloads'));

// ffmpeg.setFfmpegPath(ffmpegStatic.path);
// console.log(details);

const download = (opt: { url: string; headers: { [key: string]: string } }) => {
  const url = opt.url;
  const token = opt.headers['X-Radiko-AuthToken'];

  log.info('url: ', url);
  log.info('X-Radiko-AuthToken: ', token);

  const ans = dialog.showMessageBox({
    type: 'info',
    buttons: ['Yes', 'No'],
    title: 'ダウンロード選択',
    message: 'ダウンロードを開始しますか?',
    detail: url,
  });

  if (ans === 0) {
    log.info('yes');
    log.info(ffmpegPath);
  }

  // exec(
  //   'cd $HOME &&' +
  //     ffmpegStatic.path.replace(
  //       'app.asar',
  //       'app.asar.unpacked/node_modules/ffmpeg-static-electron',
  //     ) +
  //     ' -headers "X-Radiko-AuthToken: ' +
  //     token +
  //     '" -i "' +
  //     url +
  //     '" -acodec copy "radiko.ts"',
  // );
};

export { download };

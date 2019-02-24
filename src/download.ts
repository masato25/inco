import { app, dialog, Notification } from 'electron';
import log from 'electron-log';
import { spawn } from 'child_process';
import * as path from 'path';
// tslint:disable-next-line
const ffmpegStatic = require("ffmpeg-static-electron");
const isDevelopment = process.env.NODE_ENV !== 'production';

const generateFfmpegPath = () => {
  if (isDevelopment) {
    const repPath = path.join(
      'dist_electron',
      '..',
      'node_modules',
      'ffmpeg-static-electron',
    );
    return ffmpegStatic.path.replace('dist_electron', repPath);
  }
  return ffmpegStatic.path.replace(
    'app.asar',
    'app.asar.unpacked/node_modules/ffmpeg-static-electron',
  );
};

const download = (opt: {
  url: string;
  headers: { [key: string]: string };
  title: string;
}) => {
  const ffmpegPath = generateFfmpegPath();
  const url: string = opt.url;
  const token = opt.headers['X-Radiko-AuthToken'];
  const title = opt.title;

  log.info('url: ', url);
  log.info('X-Radiko-AuthToken: ', token);
  log.info('title: ', title);

  const notification = new Notification({
    title: 'ダウンロードが開始されました',
    body: title,
  });
  notification.show();

  log.info(ffmpegPath);

  const options = [
    '-headers',
    'X-Radiko-AuthToken: ' + token + '',
    '-i',
    url,
    '-bsf:a',
    'aac_adtstoasc',
    '-y',
    '-acodec',
    'copy',
    path
      .join(app.getPath('downloads'), title.replace(/\/|:/g, '-') + '.mp4')
      .replace(/\|/g, ' ')
      .replace(/\s+/g, '_'),
  ];
  const ffmpeg = spawn(ffmpegPath, options);

  ffmpeg.stdout.on('data', (data) => {
    log.info(`stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    log.info(`stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    log.info(`child process exited with code ${code}`);
    const notifi = new Notification({
      title: 'ダウンロードが完了しました',
      body: title,
    });
    notifi.show();
  });
  ffmpeg.on('error', (err) => {
    dialog.showErrorBox('ダウンロード中にエラーが発生しました', err.message);
  });
};

export { download };

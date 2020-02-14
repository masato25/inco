import { app, dialog, BrowserWindow, Notification } from 'electron';
import log from 'electron-log';
import { spawn } from 'child_process';
import * as path from 'path';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import Config from 'electron-config';

const config = new Config();

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

const time2sec = (time: string): number => {
  const parse = time.split(':');
  return (
    parseInt(parse[0], 10) * 60 * 60 +
    parseInt(parse[1], 10) * 60 +
    parseInt(parse[2], 10)
  );
};

const download = (opt: {
  win: BrowserWindow;
  url: string;
  headers: { [key: string]: string };
  title: string;
}) => {
  const win = opt.win;
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

  const downloadPath = config.get('downloads') || app.getPath('downloads');

  const options = [
    '-fflags',
    '+discardcorrupt',
    '-headers',
    'X-Radiko-AuthToken: ' + token + '',
    '-i',
    url,
    '-acodec',
    'copy',
    '-vn',
    '-bsf:a',
    'aac_adtstoasc',
    '-y',
    path
      .join(downloadPath, title.replace(/\/|:/g, '-') + '.m4a')
      .replace(/\|/g, ' ')
      .replace(/\s+/g, '_'),
  ];
  const ffmpeg = spawn(ffmpegPath, options);

  const getProgress = (str: string): string => {
    const time = str.match(/size=([\w|\s]+) time/);
    if (time && Array.isArray(time) && time[1]) {
      return time[1];
    }
    return '';
  };

  let child: BrowserWindow | null = new BrowserWindow({
    width: 500,
    height: 200,
    parent: win,
    show: false,
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    child.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) {
      // child.webContents.openDevTools();
    }
  } else {
    createProtocol('app');
    child.loadURL('app://./index.html');
  }

  child.show();
  child.on('closed', () => {
    // ffmpeg.stdin.pause();
    ffmpeg.kill();
    child = null;
  });

  ffmpeg.stdout.on('data', (data) => {
    log.info(`stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data: any) => {
    if (child) {
      child.webContents.send('title', title);
      const progress = getProgress(data.toString());
      // child.setProgressBar(progress);
      child.webContents.send('progress', progress);
      log.info(`stderr: ${data}`);
    } else {
      ffmpeg.kill();
    }
  });

  ffmpeg.on('close', (code) => {
    log.info(`child process exited with code ${code}`);
    const notifi = new Notification({
      title: 'ダウンロードが完了しました',
      body: title,
    });
    notifi.show();
    if (child) {
      child.setProgressBar(-1);
      child.webContents.send('progress', 1);
      setTimeout(() => {
        if (child) {
          child.close();
        }
      }, 3000);
    }
  });
  ffmpeg.on('error', (err) => {
    dialog.showErrorBox('ダウンロード中にエラーが発生しました', err.message);
  });
};

export { download };

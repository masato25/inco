'use strict';

import { app, protocol, BrowserWindow, session, Menu } from 'electron';
import { installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import { download } from './download';
import Config from 'electron-config';
import log from 'electron-log';

// tslint:disable-next-line:no-var-requires
if (require('electron-squirrel-startup')) {
  app.quit();
}
import './auto-update';

const isDevelopment = process.env.NODE_ENV !== 'production';

const config = new Config({
  defaults: {
    bounds: {
      width: 1152,
      height: 600,
    },
  },
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: any;

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });
function createWindow() {
  const { width, height, x, y } = config.get('bounds');

  win = new BrowserWindow({ width, height, x, y });

  win.loadURL('http://radiko.jp/#!/timeshift');

  win.on('closed', () => {
    win = null;
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'inco',
      submenu: [
        {
          label: 'Version: ' + app.getVersion(),
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  win.on('resize', () => {
    config.set('bounds', win.getBounds());
  });
  win.on('move', () => {
    config.set('bounds', win.getBounds());
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools();
  }
  (session as any).defaultSession.webRequest.onBeforeSendHeaders(
    (details: any, callback: (opt: any) => void) => {
      if (
        details.url.match(/playlist.m3u8/) &&
        details.headers['X-Radiko-AuthToken']
      ) {
        download({
          win,
          url: details.url,
          headers: details.headers,
          title: win.getTitle(),
        });
      }
      callback({});
    },
  );

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

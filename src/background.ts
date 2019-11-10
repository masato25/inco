'use strict';

import { app, protocol, BrowserWindow, session, dialog, Menu } from 'electron';
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
    downloads: app.getPath('downloads'),
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

  const template: any = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'ダウンロード先の変更',
          click: () => {
            dialog.showOpenDialog(
              {
                defaultPath: config.get('downloads'),
                properties: ['openDirectory'],
              },
              (dirs: any[]) => {
                if (dirs && Array.isArray(dirs) && dirs.length) {
                  const dir = dirs.shift();
                  config.set('downloads', dir);
                }
              },
            );
          },
        },
        { type: 'separator' },
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        // {role: 'toggledevtools'},
        // {type: 'separator'},
        // {role: 'resetzoom'},
        // {role: 'zoomin'},
        // {role: 'zoomout'},
        { role: 'togglefullscreen' },
        { type: 'separator' },
      ],
    },
    {
      role: 'window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
    {
      role: 'version',
      submenu: [
        {
          label: 'Version: ' + app.getVersion(),
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    // Edit menu
    // template[1].submenu.push(
    //   {type: 'separator'},
    //   {
    //     label: 'Speech',
    //     submenu: [
    //       {role: 'startspeaking'},
    //       {role: 'stopspeaking'}
    //     ]
    //   }
    // )

    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
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

const {app, BrowserWindow, ipcMain} = require('electron');

let win

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600, show: false});

  win.loadURL(`file://${__dirname}/index.html`);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('async-msg', (event, arg) => {
  console.log(arg);
  event.sender.send('async-reply', 'pong');
});

ipcMain.on('sync-msg', (event, arg) => {
  console.log(arg);
  event.returnValue = 'pong';
});

app.on('ready', createWindow);

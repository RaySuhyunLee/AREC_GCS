const {app, BrowserWindow, ipcMain} = require('electron');
const SerialPort = require('serialport');

let win;

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

app.on('ready', createWindow);

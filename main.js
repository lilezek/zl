const electron = require('electron');
const path = require('path');

// Module to control application life.
const {
  app
} = electron;

// Module to create native browser window.
const {
  BrowserWindow
} = electron;

const {
  ipcMain
} = electron;

const appDir = __dirname;

function createWindows() {
  let editor = new BrowserWindow({
    width: 800,
    height: 1000,
    x: 0,
    y: 0,
    title: "Editor ZL",
    webPreferences: {
      nodeIntegration: false,
      preload: `${appDir}/e-ipc.js`
    }
  });

  // and load the index.html of the app.
  editor.loadURL(`file://${appDir}/e-index.html`);

  // Open the DevTools.
  editor.webContents.openDevTools();

  // Emitted when the window is closed.
  editor.on('closed', () => {
    app.quit();
  });

  let canvas = new BrowserWindow({
    width: 800,
    height: 1000,
    x: 900,
    y: 0,
    title: "Resultado",
    webPreferences: {
      nodeIntegration: false,
      preload: `${appDir}/e-ipc.js`
    }
  });

  // and load the index.html of the app.
  canvas.loadURL(`file://${appDir}/e-canvas.html`);

  // Open the DevTools.
  canvas.webContents.openDevTools();

  // Emitted when the window is closed.
  canvas.on('closed', () => {
    app.quit();
  });

  ipcMain.on("ejecutar", function(event, javascript) {
    canvas.webContents.send("ejecutar", javascript);
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindows();
  }
});

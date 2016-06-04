const cluster = require('cluster');
const cJSON = require('circular-json');

//////////////////////////////////////////////////////////////
const async = require("async");
var zl = require('./compilador')({
  log: () => undefined
}, async);

var UglifyJS = require('uglify-js');
var js_beautify = require('js-beautify').js_beautify;

var options = {
  uglify: false,
  beautify: false
};

var uglify = function(code) {
  if (options.uglify)
    return UglifyJS.minify(code, {
      fromString: true
    }).code;
  return code;
}

var beautify = function(code) {
    if (options.beautify)
      return js_beautify(code);
    return code;
  }
  //////////////////////////////////////////////////////////////////

if (cluster.isMaster) {
  cluster.fork().on('message', (arg) => {
    var {
      msgid
    } = arg;
    if (msgid == 'compilado') {
      editor.webContents.send('compilado', arg.ccontenido);
    }
  });
} else {
  process.on('message', (arg) => {
    var {
      msgid
    } = arg;
    if (msgid == "compilar") {
      var {
        zlcode
      } = arg;
      zl.Compilar(zlcode, {}, function(e, compilado) {
        process.send({
          msgid: 'compilado',
          ccontenido: cJSON.stringify([e, compilado])
        });
      });
    }
  });
  return;
}

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

let editor;
let canvas;

function createWindows() {
  editor = new BrowserWindow({
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
    editor = null;
    app.exit(0);
  });

  canvas = new BrowserWindow({
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
    canvas = null;
    app.exit(0);
  });

  canvas.on('close', () => {
    canvas.webContents.send("abortar");
    canvas.hide();
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

// Eventos de IPC:

ipcMain.on("ejecutar", function(event, javascript) {
  canvas.show();
  canvas.webContents.send("ejecutar", javascript);
})

ipcMain.on("abortar", function(event) {
  canvas.hide();
  canvas.webContents.send("abortar");
})

ipcMain.on("pausar", function(event, info) {
  editor.webContents.send("pausar", info);
})

ipcMain.on("continuar", function(event) {
  canvas.webContents.send("continuar");
  canvas.focus();
})


// Worker: hilo donde se compila en paralelo
var worker = cluster.workers[1];
// acumZLcode: último código zl que se acumula si el worker no terminó de compilar
// pero el usuario ya está escribiendo nuevo código
var acumZlcode;
ipcMain.on("compilar", function(event, zlcode) {
  worker.send({
    msgid: "compilar",
    zlcode: zlcode
  })
})

// ipc para electron
const {
  ipcRenderer
} = require('electron');
process.once('loaded', () => {
  global.ipc = ipcRenderer;
});

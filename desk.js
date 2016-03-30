'use strict';

const actions  = require('desk-base'),
      electron = require('electron'),
      ipc      = electron.ipcMain,
      libPath  = require('path'),
      os       = require('os');

const app = electron.app;

let win;

var debug;
process.argv.forEach(value => {
	if (value === "debug") debug = true;
});

function createWindow () {
	// Create the browser window.
	win = new electron.BrowserWindow({width: 800, height: 600});

	var url = debug ? ('file://' + __dirname + '/node_modules/desk-ui/source/index.html')
		: 'file://' + __dirname + '/node_modules/desk-ui/build/index.html';
	win.loadURL(url);

	if (debug) win.webContents.openDevTools();

	win.on('closed', function() {
		win = null;
	});
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

var deskDir = libPath.join(os.homedir(), 'desk') + '/';

ipc.on('getRootDir', (e) => {
	e.returnValue = deskDir;
});
actions.include(__dirname + '/lib/includes');

function log (message) {
	console.log(message);
	if (win) window.webContents.send("log", message);
}

log("Start : " + new Date().toLocaleString());

ipc.on('action', function(event, parameters) {
		actions.execute(parameters, function (response) {
			console.log(response);
			console.log("here");
			win.webContents.send("action finished", response);
			win.webContents.send("test", "hellllo");
		});
	})
	.on('setEmitLog', function (log) {
		actions.setEmitLog(log);
	});

function testSend() {
	win.webContents.send("test", "hellllo");
	setTimeout(testSend, 2000);
}

actions.on('log', log);

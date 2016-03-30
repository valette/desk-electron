'use strict';

const actions  = require('desk-base'),
      electron = require('electron'),
      libPath  = require('path'),
      os       = require('os');

let win,
    debug;

process.argv.forEach(value => {
	if (value === "debug") debug = true;
});

function createWindow () {
	win = new electron.BrowserWindow({width: 800, height: 600});

	var url = debug ? ('file://' + __dirname + '/node_modules/desk-ui/source/index.html')
		: 'file://' + __dirname + '/node_modules/desk-ui/build/index.html';

	win.loadURL(url);

	if (debug) win.webContents.openDevTools();

	win.on('closed', function() {
		win = null;
	});
}

electron.app.on('ready', createWindow)
	.on('window-all-closed', function () {
	  // On OS X it is common for applications and their menu bar
	  // to stay active until the user quits explicitly with Cmd + Q
	  if (process.platform !== 'darwin') {
		electron.app.quit();
	  }
	})
	.on('activate', function () {
	  // On OS X it's common to re-create a window in the app when the
	  // dock icon is clicked and there are no other windows open.
	  if (win === null) {
		createWindow();
	  }
	});

actions.include(__dirname + '/lib/includes');

function log (message) {
	console.log(message);
	if (win) window.webContents.send("log", message);
}

electron.ipcMain.on('getRootDir', (e) => {
		e.returnValue = libPath.join(os.homedir(), 'desk') + '/';
	})
	.on('action', function(event, parameters) {
		actions.execute(parameters, function (response) {
			event.sender.send("action finished", response);
		});
	})
	.on('setEmitLog', function (log) {
		actions.setEmitLog(log);
	});

actions.on('log', log);

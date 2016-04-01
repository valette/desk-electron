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

electron.app.setName('desk');
electron.app.on('ready', () => {
	win = new electron.BrowserWindow({
		icon: 'node_modules/desk-ui/lib/ui/source/resource/desk/desk.png'
	});

	var url = 'file://' + __dirname + '/node_modules/desk-ui/'
		+ (debug ? 'source' : 'build')
		+ '/index.html';

	win.loadURL(url);

	win.on('closed', () => {win = null;});
})
.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		electron.app.quit();
	}
})
.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

actions.include(__dirname + '/lib/includes');

electron.ipcMain.on('getRootDir', (e) => {
	e.returnValue = libPath.join(os.homedir(), 'desk') + '/';
})
.on('action', (event, parameters) => {
	actions.execute(parameters, (response) => {
		event.sender.send("action finished", response);
	});
})
.on('setEmitLog', (event, bool) => {
	actions.setEmitLog(bool);
});

actions.on("log", console.log.bind(console));
actions.oldEmit = actions.emit;
actions.emit = (event, message) => {
	actions.oldEmit(event, message);
	if (win) win.webContents.send(event, message);
}

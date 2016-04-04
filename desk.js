'use strict';

const electron = require('electron'),
      debug = process.argv[2] === "debug";

let win;

electron.app.on('ready', () => {
	win = new electron.BrowserWindow({
		icon: 'node_modules/desk-ui/lib/ui/source/resource/desk/desk.png'
	});

	var url = 'file://' + __dirname + '/node_modules/desk-ui/'
		+ (debug ? 'source' : 'build')
		+ '/index.html';

	win.loadURL(url);
	if (debug) win.webContents.openDevTools();
	win.maximize();
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

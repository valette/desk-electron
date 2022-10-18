'use strict';

const electron = require('electron'),
      debug    = process.argv[2] === "debug",
      fs       = require('fs'),
      join     = require('path').join;

//require( 'electron-debug' )( { enabled : true, showDevTools : true } );

electron.app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true');
electron.Menu.setApplicationMenu( null );

const rootPath = join( "file://", __dirname, "node_modules/desk-ui" );
const basePath = join( rootPath, debug ? 'compiled/source/' : 'compiled/dist/' );

let win;

electron.app.on('ready', () => {


	win = new electron.BrowserWindow({
		icon: 'basePath + "resource/desk/desk.png',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false
		}
	});

	const url = basePath + 'index.html';
	win.loadURL(url);
	if (debug) win.webContents.openDevTools();
	win.maximize();
	win.on('close', () => {
		process.exit();
	});

	var promptResponse
	electron.ipcMain.on('prompt', function(eventRet, arg) {
		promptResponse = null
		var promptWindow = new electron.BrowserWindow({
			width: 200,
			height: 100,
			show: false,
			resizable: false,
			movable: false,
			alwaysOnTop: true,
			frame: false
		});
		arg.val = arg.val || ''
		const promptHtml = '<label for="val">' + arg.title + '</label>\
			<input id="val" value="' + arg.val + '" autofocus />\
			<button onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'val\').value);window.close()">Ok</button>\
			<button onclick="window.close()">Cancel</button>\
			<style>body {font-family: sans-serif;} button {float:right; margin-left: 10px;} label,input {margin-bottom: 10px; width: 100%; display:block;}</style>'
		promptWindow.loadURL('data:text/html,' + promptHtml)
		promptWindow.show()
		promptWindow.on('closed', function() {
			eventRet.returnValue = promptResponse
			promptWindow = null
		});
	})
	.on('prompt-response', function(event, arg) {
		if (arg === ''){ arg = null }
		promptResponse = arg
	});
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

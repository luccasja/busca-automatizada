const { app, BrowserWindow } = require('electron');
require('../backend');

function createWindow() {
	
	let janela = new BrowserWindow(
		{
			width: 800,
			height: 720,
			webPreferences: { nodeIntegration: true }
		}
	)
	janela.removeMenu();
	janela.loadURL('http://localhost:3000/');

}

app.whenReady().then(createWindow);
const { app, BrowserWindow, nativeTheme, Menu } = require('electron');
const path = require('path');

require('@electron/remote/main').initialize();


function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, './src/public/img/icone.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,  
      contextIsolation: false  
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile('./src/views/index.html');
}

function createCadastroAdmWindow() {
  const { BrowserWindow } = require('@electron/remote');
  const win = new BrowserWindow({
    width: 600,
    height: 700,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,  
      contextIsolation: false
    }
  });

  win.loadFile('./src/views/cadastroAdm.html');
}


app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


module.exports = { createCadastroAdmWindow };

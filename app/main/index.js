const { app, BrowserWindow } = require('electron')
const { NAME, PROTOCOL } = require('./const')

require('./actions')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: NAME,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win.loadFile('dist/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.setAsDefaultProtocolClient(PROTOCOL)

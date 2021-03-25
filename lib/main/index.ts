import { app, BrowserWindow, ipcMain } from 'electron'
import robot from './util/robot'
import { NAME } from './const'

// Import API classes so they can set-up their actions.
import './api'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: NAME,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  })

  win.loadFile(__dirname + '/../../renderer/dist/index.html')
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

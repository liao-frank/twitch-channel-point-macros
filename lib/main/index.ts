import { app, BrowserWindow } from 'electron'
import Window from './util/Window'

// Import API classes so they can set-up their actions.
import './api'

Window.create()

// TODO: Remove.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    Window.create()
  }
})

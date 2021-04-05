import { app, BrowserWindow } from 'electron'
import Window from './util/Window'

// Import state to set up actions.
import './state'

Window.create()

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    Window.create()
  }
})

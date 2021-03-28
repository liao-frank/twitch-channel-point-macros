import { app, BrowserWindow } from 'electron'
import sequences from './state/sequences'
import Window from './util/Window'
import Redemptions, { Redemption } from './Redemptions'

// Import state so they can set-up their actions.
import './state'

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

// Start redemption polling.
const redemptions = new Redemptions()
redemptions.addListener((redemption: Redemption) => {
  sequences.trigger(redemption.rewardId)
})

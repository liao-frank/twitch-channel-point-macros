const { ipcMain } = require('electron')
const auth = require('../twitch-api/auth')

ipcMain.handle('get-tokens', () => {
  auth.getTokens()
  ipcMain.invoke('get-tokens-complete', auth.accessToken)
})

// ipcMain.handle('refresh-tokens', () => {
//   auth.refreshTokens()
// })

// ipcMain.handle('revoke-tokens', () => {
//   auth.refreshTokens()
// })

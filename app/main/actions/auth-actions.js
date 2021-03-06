const { ipcMain } = require('electron')
const auth = require('../api/auth')

ipcMain.handle('get-tokens', async () => {
  await auth.getTokens()
  // Don't expose tokens to the renderer.
  return true
})

// ipcMain.handle('refresh-tokens', () => {
//   auth.refreshTokens()
// })

ipcMain.handle('revoke-tokens', async () => {
  await auth.revokeTokens()
})

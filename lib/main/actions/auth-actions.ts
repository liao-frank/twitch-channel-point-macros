import { ipcMain } from 'electron'
import auth from '../api/auth'

ipcMain.handle('fetch-tokens', async () => {
  await auth.getTokens()
  // Don't expose tokens to the renderer.
  return true
})

ipcMain.handle('revoke-tokens', async () => {
  await auth.revokeTokens()
})

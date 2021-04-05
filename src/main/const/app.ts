export const NAME = 'Twitch Channel Point Macros'
export const POLL_INTERVAL_MS = 10 * 1000
export const PORT_OPTIONS = [22712, 31594, 19959, 12576, 18081]
export const SCOPES = [
  'user:read:email',
  'channel:read:redemptions',
  'channel:manage:redemptions',
]
export const WINDOW_OPTIONS = {
  title: NAME,
  width: 800,
  height: 600,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
  },
}

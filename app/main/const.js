require('dotenv').config()

module.exports = {
  NAME: 'Twitch Channel Points Controller',
  PORT_OPTIONS: [22712, 31594, 19959, 12576, 18081],
  PROTOCOL: 'twitch-cpc',
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
  TWITCH_SECRET: process.env.TWITCH_SECRET,
}

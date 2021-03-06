require('dotenv').config()

module.exports = {
  NAME: 'Twitch Channel Points Controller',
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
  TWITCH_SECRET: process.env.TWITCH_SECRET,
}

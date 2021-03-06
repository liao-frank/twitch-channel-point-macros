const express = require('express')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy
const portastic = require('portastic')

const { PORT_OPTIONS, PROTOCOL, TWITCH_CLIENT_ID, TWITCH_SECRET } = require('../const')

let accessToken
let refreshToken

// Set-up OAuth server w/ Express.
const app = express()
app.use(passport.initialize())

app.get(
  '/auth/twitch',
  passport.authenticate('twitch',
  { scope: 'user_read' }))

app.get(
  '/auth/twitch/callback',
  passport.authenticate('twitch',
  { successRedirect: PROTOCOL + '://', failureRedirect: PROTOCOL + '://' }))

const getServer = (port) => {
  return new Promise(res => {
    const server = app.listen(port, () => {
      res(server)
    })
  })
}

const init = async () => {
  const availablePorts = await portastic.filter(PORT_OPTIONS)
  if (!availablePorts.length) return

  const port = availablePorts[0]
  await getServer(port)

  passport.use('twitch', new OAuth2Strategy({
      authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
      tokenURL: 'https://id.twitch.tv/oauth2/token',
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: `http://localhost:${port}/auth/twitch/callback`,
      // TODO: Investigate `state: true`.
    },
    (accessTokenB, refreshTokenB, profile, done) => {
      accessToken = accessTokenB
      refreshToken = refreshTokenB
      done(null, profile)
    }
  ))
}

init()
module.exports = {
  getTokens() {
    // TODO: Remove.
    console.log(`http://localhost:${port}/auth/twitch/`)
  },
  refreshTokens() {

  },
  revokeTokens() {

  },
  get accessToken() { return accessToken },
  get refreshToken() { return refreshToken },
}

import bent from 'bent'
import electron from 'electron'
import express from 'express'
import passport from 'passport'
import { OAuth2Strategy } from 'passport-oauth'
import portastic from 'portastic'
import { TWITCH_CLIENT_ID, TWITCH_SECRET } from '../const'
import PromiseManager from '../util/PromiseManager'

const PORT_OPTIONS = [22712, 31594, 19959, 12576, 18081]
const revoke = bent('https://id.twitch.tv/oauth2/revoke', 'POST', 200, 'string')

let accessToken
let port
let refreshToken
let tokensPromiseManager

// Set-up OAuth server w/ Express.
const app = express()
app.use(passport.initialize())

app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }))

app.get(
  '/auth/twitch/callback',
  passport.authenticate('twitch', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure',
  })
)

app.get('/auth/success', (_, res) =>
  res.send('Success. Please return to the app.')
)

app.get('/auth/failure', (_, res) =>
  res.send('Failure. <a href="/auth/twitch">Please try again.</a>')
)

const getServer = (port) => {
  return new Promise((res) => {
    const server = app.listen(port, () => {
      res(server)
    })
  })
}

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})

const init = async () => {
  const availablePorts = await portastic.filter(PORT_OPTIONS)
  if (!availablePorts.length) return

  port = availablePorts[0]
  await getServer(port)

  passport.use(
    'twitch',
    new OAuth2Strategy(
      {
        authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
        tokenURL: 'https://id.twitch.tv/oauth2/token',
        clientID: TWITCH_CLIENT_ID,
        clientSecret: TWITCH_SECRET,
        callbackURL: `http://localhost:${port}/auth/twitch/callback`,
        // TODO: Investigate `state: true`.
      },
      (accessTokenB, refreshTokenB, profile, done) => {
        tokensPromiseManager.short({ accessToken, refreshToken })
        done(null, profile)
      }
    )
  )
}

init()
export default {
  async getTokens() {
    electron.shell.openExternal(`http://localhost:${port}/auth/twitch/`)

    if (tokensPromiseManager && !tokensPromiseManager.fulfilled) {
      tokensPromiseManager.cancel()
    }

    tokensPromiseManager = PromiseManager.from(new Promise(() => {}))
    const result = await tokensPromiseManager.promise

    accessToken = result.accessToken
    refreshToken = result.refreshToken

    return result
  },
  refreshTokens() {},
  async revokeTokens() {
    if (!accessToken) return
    await revoke(`?client_id=${TWITCH_CLIENT_ID}&token=${accessToken}`)
    accessToken = undefined
    refreshToken = undefined
  },
  get accessToken() {
    return accessToken
  },
  get refreshToken() {
    return refreshToken
  },
}

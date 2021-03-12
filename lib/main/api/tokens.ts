import bent from 'bent'
import electron from 'electron'
import express from 'express'
import passport from 'passport'
import { OAuth2Strategy } from 'passport-oauth'
import portastic from 'portastic'
import { TWITCH_CLIENT_ID, TWITCH_SECRET } from '../const'
import PromiseManager from '../util/PromiseManager'
import State from '../util/State'

class Tokens {
  public state: State<TokensState>

  public oauthServer?: OauthServer
  public oauthServerPromise: Promise<OauthServer>
  private readonly oauthServerPromiseManager: PromiseManager<OauthServer>

  private fetchPromiseManager?: PromiseManager<TokensState>

  constructor() {
    this.oauthServerPromiseManager = PromiseManager.dependent<OauthServer>()
    this.oauthServerPromise = this.oauthServerPromiseManager.promise
    // Create and set-up OAuth server.
    Tokens.createServer().then((oauthServer) => {
      this.oauthServer = oauthServer
      this.oauthServerPromiseManager.short(oauthServer)
      Tokens.setupServer(oauthServer)
      // Set-up passport.
      this.setupPassport(oauthServer)
    })

    // Set-up state and extra actions.
    this.state = new State(this, EMPTY_TOKENS_STATE)
    this.state.action('fetch', () => this.fetch())
    this.state.action('revoke', () => this.revoke())
  }

  async fetch() {
    if (!this.oauthServer) return

    electron.shell.openExternal(
      `http://localhost:${this.oauthServer.port}/auth/twitch/`
    )

    if (this.fetchPromiseManager && !this.fetchPromiseManager.fulfilled) {
      this.fetchPromiseManager.cancel()
    }

    this.fetchPromiseManager = PromiseManager.dependent<TokensState>()
    const result = await this.fetchPromiseManager.promise
    this.state.set(result)

    return result
  }

  async revoke() {
    const { accessToken } = this.state.get()
    if (!accessToken) return
    await REVOKE(`?client_id=${TWITCH_CLIENT_ID}&token=${accessToken}`)
    this.state.set(EMPTY_TOKENS_STATE)
  }

  setupPassport({ port }: OauthServer) {
    passport.use(
      'twitch',
      new OAuth2Strategy(
        {
          authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
          tokenURL: 'https://id.twitch.tv/oauth2/token',
          clientID: TWITCH_CLIENT_ID,
          clientSecret: TWITCH_SECRET,
          callbackURL: `http://localhost:${port}/auth/twitch/callback`,
        },
        (accessToken, refreshToken, profile, done) => {
          this.fetchPromiseManager?.short({ accessToken, refreshToken })
          done(null, profile)
        }
      )
    )

    passport.serializeUser((user, done) => {
      done(null, user)
    })
    passport.deserializeUser((user, done) => {
      done(null, user)
    })
  }

  static async createServer(): Promise<OauthServer> {
    const app = express()

    const availablePorts = await portastic.filter(PORT_OPTIONS)
    if (!availablePorts.length) {
      throw Error('No port available for OAuth server.')
    }

    const port = availablePorts[0]

    return new Promise((res) => {
      const server = app.listen(port, () => {
        res({ app, server, port })
      })
    })
  }

  // Set-up paths and middleware.
  static async setupServer({ app }: OauthServer) {
    app.use(passport.initialize())

    app.get(
      '/auth/twitch',
      passport.authenticate('twitch', { scope: 'user_read' })
    )
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
  }
}

const EMPTY_TOKENS_STATE = {
  accessToken: '',
  refreshToken: '',
}
const PORT_OPTIONS = [22712, 31594, 19959, 12576, 18081]
const REVOKE = bent('https://id.twitch.tv/oauth2/revoke', 'POST', 200, 'string')

interface OauthServer {
  app: express.App
  server: express.Server
  port: number
}

interface TokensState {
  accessToken: string
  refreshToken: string
}

export default new Tokens()

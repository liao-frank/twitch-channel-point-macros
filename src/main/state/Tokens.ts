import bent from 'bent'
import electron from 'electron'
import express from 'express'
import passport from 'passport'
import { OAuth2Strategy } from 'passport-oauth'
import portastic from 'portastic'
import { PORT_OPTIONS, SCOPES } from '../const/app'
import { TWITCH_CLIENT_ID, TWITCH_SECRET } from '../const/env'
import { Action, PromiseManager, State, store } from '../util'
import { ActionType, StateKey } from '../../common/type'

class TokensHelper {
  public state: State<Tokens>

  private readonly oauthServerPromiseManager: PromiseManager<OauthServer>

  private oauthServerPromise: Promise<OauthServer>
  private fetchPromiseManager?: PromiseManager<Tokens>

  constructor() {
    this.oauthServerPromiseManager = PromiseManager.dependent<OauthServer>()
    this.oauthServerPromise = this.oauthServerPromiseManager.promise
    // Create and set-up OAuth server.
    TokensHelper.createServer().then((oauthServer) => {
      this.oauthServerPromiseManager.short(oauthServer)
      TokensHelper.setupServer(oauthServer)
      // Set-up passport.
      this.setupPassport(oauthServer)
    })

    // Set-up state and extra actions.
    this.state = new State(StateKey.Tokens)

    Action.handle(ActionType.TokensFetch, () => this.fetch())
    Action.handle(ActionType.TokensRevoke, () => this.revoke())
    Action.handle(ActionType.TokensValidate, () => this.validate())
  }

  async fetch() {
    const oauthServer = await this.oauthServerPromise

    electron.shell.openExternal(
      `http://localhost:${oauthServer.port}/auth/twitch/`
    )

    if (this.fetchPromiseManager && !this.fetchPromiseManager.fulfilled) {
      this.fetchPromiseManager.cancel()
    }

    this.fetchPromiseManager = PromiseManager.dependent<Tokens>()
    const result = await this.fetchPromiseManager.promise
    this.state.update(result)

    return result
  }

  async revoke() {
    const tokens = this.state.read()
    if (!tokens || !tokens.accessToken) return
    await REVOKE(`?client_id=${TWITCH_CLIENT_ID}&token=${tokens.accessToken}`)
    store.delete(StateKey.Rewards)
    store.delete(StateKey.User)
    this.state.delete()
  }

  async validate(): Promise<boolean> {
    const tokens = this.state.read()
    if (tokens === undefined) return false

    try {
      await VALIDATE('', null, { Authorization: `OAuth ${tokens.accessToken}` })
      return true
    } catch {
      return false
    }
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
      // @ts-ignore
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

    app.get('/auth/twitch', passport.authenticate('twitch', { scope: SCOPES }))
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

const REVOKE = bent('https://id.twitch.tv/oauth2/revoke', 'POST', 'string')
const VALIDATE = bent('https://id.twitch.tv/oauth2/validate', 'json')

// TODO: Use express types.
interface OauthServer {
  app: any
  server: any
  port: number
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export default new TokensHelper()

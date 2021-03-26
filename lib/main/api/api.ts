import bent from 'bent'
import { POLL_INTERVAL } from '../const/app'
import tokens from './tokens'
import { TWITCH_CLIENT_ID } from '../const/env'

const caller = bent('https://api.twitch.tv/', 'json')

class Api {
  static async call(
    path: string = '',
    body: any = null,
    mockMap?: Map</* statusCode: */ number, /* mockResponse: */ any>
  ) {
    if (!body) body = null
    const tokensState = tokens.get()
    if (!tokensState) {
      throw new NoAccessTokenFoundError()
    }

    const { accessToken } = tokensState
    let response
    try {
      response = await caller(path, body, {
        'Client-ID': TWITCH_CLIENT_ID,
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: 'Bearer ' + accessToken,
      })
      // Check for 200 OK mock response.
      if (mockMap?.has(200)) {
        return mockMap.get(200)
      }
    } catch (e) {
      // Check for error status mock responses (e.g. 403).
      if (mockMap?.has(e.statusCode)) {
        return mockMap.get(e.statusCode)
      }
      // Delete the store if unauthorized.
      if (e.statusCode === 401) {
        tokens.revoke()
      }
      throw e
    }

    return response
  }

  static async poll(
    path: string | (() => string),
    body: any = null,
    callback: (response: any) => void,
    mockMap?: Map</* statusCode: */ number, /* mockResponse: */ any>
  ) {
    return setInterval(async () => {
      const pathStr = typeof path === 'string' ? path : path()
      if (!pathStr) return
      try {
        const response = await Api.call(pathStr, body, mockMap)
        callback(response)
      } catch (e) {
        // Ignore call if there are no access tokens.
        if (e instanceof NoAccessTokenFoundError) return
        throw e
      }
    }, POLL_INTERVAL)
  }
}

export class NoAccessTokenFoundError extends Error {
  __proto__: Error

  constructor() {
    const trueProto = new.target.prototype
    super('No access token was found.')
    this.name = 'NoAccessTokenFoundError'

    this.__proto__ = trueProto
  }
}

export default Api

import bent from 'bent'
import { POLL_INTERVAL_MS } from '../const/app'
import Tokens from '../state/Tokens'
import { TWITCH_CLIENT_ID } from '../const/env'

const caller = bent('https://api.twitch.tv/', 'json')

class Api {
  static async call(flexPath: FlexPath, body?: any, errorMocks?: ErrorMockMap) {
    if (!flexPath) flexPath = ''
    if (!body) body = null

    const path = await Api.flexPathToPath(flexPath)
    const { accessToken } = await Tokens.state.readDefined()
    let response

    try {
      response = await caller(path, body, {
        'Client-ID': TWITCH_CLIENT_ID,
        Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: 'Bearer ' + accessToken,
      })
    } catch (e) {
      if (e.statusCode === 401) {
        Tokens.revoke()
      }
      // Check for error status mock responses.
      if (errorMocks?.has(e.statusCode)) {
        return errorMocks.get(e.statusCode)
      }
      throw e
    }

    return response
  }

  static poll(
    flexPath: FlexPath,
    body: any,
    onSuccess: (response: any) => void,
    onError?: (e: Error) => void,
    errorMocks?: ErrorMockMap
  ) {
    // Wait POLL_INTERVAL milliseconds after completion to call next call.
    Api.call(flexPath, body, errorMocks)
      .then(onSuccess)
      .catch(onError)
      .then(
        () => new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
      )
      .then(() => Api.poll(flexPath, body, onSuccess, onError, errorMocks))
  }

  static async flexPathToPath(path: FlexPath): Promise<string> {
    if (typeof path === 'string') return path
    return await path()
  }
}

type ErrorMockMap = Map</* statusCode: */ number, /* mockResponse: */ any>

type FlexPath = string | (() => string | Promise<string>)

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

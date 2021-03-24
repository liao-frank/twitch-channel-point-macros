import bent from 'bent'
import tokens from './tokens'
import { TWITCH_CLIENT_ID } from '../const/env'

const caller = bent('https://api.twitch.tv/', 'json')

class Api {
  static async call(path: string = '', body: any = null) {
    const { accessToken } = tokens.state.get()

    if (!accessToken) {
      throw Error('No access token found.')
    }

    return await caller(path, body, {
      'Client-ID': TWITCH_CLIENT_ID,
      Accept: 'application/vnd.twitchtv.v5+json',
      Authorization: 'Bearer ' + accessToken,
    })
  }
}

export default Api

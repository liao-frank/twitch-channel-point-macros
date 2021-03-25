import api from './api'
import user from './user'
import State from '../util/State'
import { MOCK_REWARDS_RESPONSE } from '../const/mock'

class Rewards {
  public state: State<Reward[]>

  constructor() {
    this.state = new State(this)
  }

  async fetch() {
    const broadcasterId = user.state.get().id

    if (!broadcasterId) {
      throw Error('No broadcaster ID found.')
    }

    let response
    try {
      response = await api.call(
        `helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`
      )
    } catch (e) {
      if (e.statusCode === 403) {
        response = MOCK_REWARDS_RESPONSE
      } else {
        throw e
      }
    }

    const rewardsState = responseToState(response)
    this.state.set(rewardsState)
    return rewardsState
  }
  static get key() {
    return 'rewards'
  }
}

export interface ImageSet {
  url_1x: string
  url_2x: string
  url_4x: string
}

export interface Reward {
  id: string
  title: string
  image?: ImageSet
  backgroundColor: string
  defaultImage: ImageSet
}

const responseToState = (response): Reward[] => {
  const rewards = response['data']
  return rewards.map((reward) => {
    const { id, title, image, default_image, background_color } = reward

    return {
      id,
      title,
      image,
      defaultImage: default_image,
      backgroundColor: background_color,
    }
  })
}

export default new Rewards()

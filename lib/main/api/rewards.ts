import api from './api'
import user from './user'
import State from '../util/State'

class Rewards {
  public state: State<RewardsState>

  constructor() {
    this.state = new State(this, DEFAULT_REWARDS_STATE)
  }

  async fetch() {
    const broadcasterId = user.state.get().id

    if (!broadcasterId) {
      throw Error('No broadcaster ID found.')
    }
    const response = await api.call(
      `helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`
    )

    const rewardsState = responseToState(response)
    this.state.set(rewardsState)
    return rewardsState
  }
}

const DEFAULT_REWARDS_STATE: RewardsState = []

type RewardsState = {
  id: string,
  backgroundColor: string,

}[]

const responseToState = (response): RewardsState => {
  const rewards = response['data']
  return rewards.map(reward => {
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

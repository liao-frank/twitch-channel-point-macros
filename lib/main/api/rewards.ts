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
    let response
    try {
      response = await api.call(
        `helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`
      )
    } catch (error) {
      console.log(error)
    }

    const rewards = response['data'][0]
    const rewardsState = { rewards }
    this.state.set(rewardsState)

    return rewardsState
  }
}

const DEFAULT_REWARDS_STATE = {
  rewards: {},
}

interface RewardsState {
  rewards: any
}

export default new Rewards()

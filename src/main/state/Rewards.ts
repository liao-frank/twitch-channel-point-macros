import User from './User'
import { Action, Api, State } from '../util'
import { ActionType, RewardsState, StateKey } from '../../common/type'

class Rewards {
  private state: State<RewardsState>

  constructor() {
    this.state = new State(StateKey.Rewards)

    Api.poll(Rewards.getPath, undefined, this.handleResponse.bind(this))

    // Register actions.
    Action.handle(ActionType.RewardsFetch, () => this.fetch())
  }

  async fetch() {
    const response = await Api.call(Rewards.getPath)
    this.handleResponse(response)
  }

  private handleResponse(response) {
    const rewards = Rewards.jsonToRewards(response)
    this.state.update(rewards)
  }

  static async getPath(): Promise<string> {
    const userState = await User.state.readDefined()
    return `helix/channel_points/custom_rewards?broadcaster_id=${userState.id}`
  }

  static jsonToRewards(json): RewardsState {
    const rewardsData = json['data']
    return rewardsData.map((reward) => {
      const {
        id,
        title,
        prompt,
        image,
        default_image,
        background_color,
      } = reward

      return {
        id,
        title,
        prompt,
        image,
        defaultImage: default_image,
        backgroundColor: background_color,
      }
    })
  }
}

export default new Rewards()

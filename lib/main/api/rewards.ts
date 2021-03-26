import api from './api'
import { isEqual } from 'lodash'
import user from './user'
import State from '../util/State'
import { MOCK_REWARDS_RESPONSE } from '../const/mock'

class RewardsHelper {
  private state: State<Reward[]>

  constructor() {
    this.state = new State(this)

    api.poll(
      RewardsHelper.getPath,
      undefined,
      this.handleResponse.bind(this),
      MOCK_MAP
    )

    this.state.action('get', () => this.get())
    this.state.action('fetch', () => this.fetch())
  }

  async fetch() {
    const response = await api.call(
      RewardsHelper.getPath(),
      undefined,
      MOCK_MAP
    )
    this.handleResponse(response)
  }

  get(): Reward[] | undefined {
    return this.state.get()
  }

  private handleResponse(response) {
    const rewards = RewardsHelper.getRewards(response)
    if (!isEqual(rewards, this.state.get())) {
      this.state.set(rewards)
    }
  }

  static getPath(): string {
    const userState = user.get()
    if (!userState) return ''
    return `helix/channel_points/custom_rewards?broadcaster_id=${userState.id}`
  }

  static getRewards(json): Reward[] {
    const rewardsData = json['data']
    return rewardsData.map((reward) => {
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

  static get key() {
    return 'rewards'
  }
}

const MOCK_MAP = new Map([[403, MOCK_REWARDS_RESPONSE]])

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

export default new RewardsHelper()

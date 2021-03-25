import api from './api'
import user from './user'
import rewards, { Reward } from './rewards'
import { REDEMPTION_POLL_INTERVAL } from '../const/app'

class RedemptionHelper {
  private readonly cutoffs = new Map<
    /* rewardId: */ string,
    /* redeemed: */ Date
  >()
  private readonly listeners = new Map<
    /* rewardId: */ string,
    /* listener: */ RedemptionListener
  >()

  constructor() {
    // Start polling interval.
    setInterval(async () => {
      const incoming = await this.fetch()

      for (const rewardId of Array.from(incoming.keys())) {
        const listener = this.listeners.get(rewardId)
        if (!listener) continue

        const redemptions = incoming.get(rewardId)
        for (const redemption of redemptions) {
          listener(redemption)
        }
      }
    }, REDEMPTION_POLL_INTERVAL)
  }

  setListener(rewardId: string, listener: RedemptionListener) {
    this.listeners.set(rewardId, listener)
  }

  // Fetches a map of new (aka incoming) redemptions, keyed by reward id.
  private async fetch(): Promise<Map</* rewardId: */ string, Redemption[]>> {
    const broadcasterId = user.state.get().id
    if (!broadcasterId) {
      throw Error('No broadcaster ID found.')
    }

    const rewardArr = rewards.state.get()

    // Fetch array of new redemptions for each reward.
    const redemptions: Redemption[][] = await Promise.all(
      rewardArr.map(
        async (reward: Reward) => await this.fetchOne(broadcasterId, reward.id)
      )
    )

    // Create map from array of arrays.
    return redemptions.reduce((acc, curr, index) => {
      if (curr instanceof Array && curr.length) {
        acc.set(rewardArr[index].id, curr)
      }
      return acc
    }, new Map())
  }

  // Fetches redemptions that the
  private async fetchOne(broadcasterId: string, rewardId: string) {
    const params = new URLSearchParams()
    params.append('broadcaster_id', broadcasterId)
    params.append('first', '1')
    params.append('reward_id', rewardId)
    params.append('sort', 'NEWEST')
    params.append('status', 'UNFULFILLED')

    const response = await api.call(
      `helix/channel_points/custom_rewards/redemptions?${params.toString()}`
    )
    let redemptions = RedemptionHelper.getRedemptions(response)

    const newCutoff = redemptions[0]
      ? new Date(redemptions[0].redeemedAt)
      : new Date(0)

    // Save an initial cutoff.
    if (!this.cutoffs.has(rewardId)) {
      this.cutoffs.set(rewardId, newCutoff)
    }

    // Filter out redemptions before the cutoff.
    const cutoff = this.cutoffs.get(rewardId)
    redemptions = redemptions.filter(
      (redemption) => cutoff < new Date(redemption.redeemedAt)
    )

    // Save new cutoff.
    this.cutoffs.set(rewardId, newCutoff)

    return redemptions
  }

  static getRedemptions(json): Redemption[] {
    const redemptions = json['data']

    return redemptions.map((redemption) => {
      const {
        id,
        user_login,
        user_id,
        user_name,
        reward,
        redeemed_at,
      } = redemption

      return {
        id,
        userLogin: user_login,
        userId: user_id,
        userName: user_name,
        rewardId: reward.id,
        rewardTitle: reward.title,
        redeemedAt: redeemed_at,
      }
    })
  }
}

type RedemptionListener = (redemption: Redemption) => void

export interface Redemption {
  id: string
  userLogin: string
  userId: string
  userName: string
  rewardId: string
  rewardTitle: string
  redeemedAt: string
}

export default new RedemptionHelper()

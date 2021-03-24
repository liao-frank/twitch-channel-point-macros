import api from './api'
import user from './user'
import rewards from './rewards'
import State from '../util/State'
import { MOCK_REDEMPTIONS_RESPONSE, MOCK_REDEMPTIONS_RESPONSE_BY_ID } from '../const/mock'

class Redemption {
    public state: State<RedemptionState>

    constructor() {
        this.state = new State(this)
    }
    
    async fetch() {
        const broadcasterId = user.state.get().id
        const rewardsId = rewards.state.get().values

        if(!broadcasterId) {
            throw Error('No broadcaster ID found.')
        }

        let response
        try {
            response = await api.call(
                `helix/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcasterId}&reward_id=${rewardsId}`
            )
        } catch (e) {
            console.log(e)
            if (e.statusCode === 403) {
                response = MOCK_REDEMPTIONS_RESPONSE
            } else {
                throw e
            }
        }
        
        const redemptionsState = responseToState(response)
        this.state.set(redemptionsState)
        return redemptionsState
    }
}

// what info do we want from redemptions?
type RedemptionsState = {
    id: string
}

const responseToState = (response): RedemptionsState => {
    const redemptions = response['data']
    return redemptions.map((redemption) => {

    })
}
import api from './api'
import State from '../util/State'

class User {
  public state: State<UserState>

  constructor() {
    this.state = new State(this)
  }

  async fetch() {
    const response = await api.call('helix/users')
    const state = responseToState(response)
    this.state.set(state)
    return state
  }

  static get key() {
    return 'user'
  }
}

interface UserState {
  id: string
  displayName: string
  profileImageUrl: string
}

const responseToState = (response) => {
  const user = response['data'][0]

  return {
    id: user.id,
    displayName: user.display_name,
    profileImageUrl: user.profile_image_url,
  }
}

export default new User()

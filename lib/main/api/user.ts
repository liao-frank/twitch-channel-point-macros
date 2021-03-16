import api from './api'
import State from '../util/State'

class User {
  public state: State<UserState>

  constructor() {
    this.state = new State(this, DEFAULT_USER_STATE)
  }

  async fetch() {
    const response = await api.call('helix/users')

    const user = response['data'][0]
    const userState = {
      id: user.id,
      displayName: user.display_name,
      profileImageUrl: user.profile_image_url,
    }
    this.state.set(userState)

    return userState
  }
}

const DEFAULT_USER_STATE = {
  id: '',
  displayName: '',
  profileImageUrl: '',
}

interface UserState {
  id: string
  displayName: string
  profileImageUrl: string
}

export default new User()

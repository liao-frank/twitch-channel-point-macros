import api from './api'
import { isEqual } from 'lodash'
import State from '../util/State'

class UserHelper {
  private state: State<User>

  constructor() {
    this.state = new State(this)

    api.poll('helix/users', undefined, this.handleResponse.bind(this))
  }

  async fetch() {
    const response = await api.call('helix/users')
    this.handleResponse(response)
  }

  get(): User | undefined {
    return this.state.get()
  }

  private handleResponse(response) {
    const user = UserHelper.getUser(response)
    if (!isEqual(user, this.state.get())) {
      this.state.set(user)
    }
  }

  static getUser(json): User {
    const userData = json['data'][0]

    return {
      id: userData.id,
      displayName: userData.display_name,
      profileImageUrl: userData.profile_image_url,
    }
  }

  static get key() {
    return 'user'
  }
}

export interface User {
  id: string
  displayName: string
  profileImageUrl: string
}

export default new UserHelper()

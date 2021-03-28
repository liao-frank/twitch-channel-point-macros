import Api from '../util/Api'
import State from '../util/State'

class UserHelper {
  private state: State<User>

  constructor() {
    this.state = new State('user')

    Api.poll('helix/users', undefined, this.handleResponse.bind(this))

    this.state.action('get', () => this.get())
    this.state.action('fetch', () => this.fetch())
  }

  async fetch() {
    const response = await Api.call('helix/users')
    this.handleResponse(response)
  }

  get(): User | undefined {
    return this.state.get()
  }

  private handleResponse(response) {
    const user = UserHelper.getUser(response)
    this.state.set(user)
  }

  static getUser(json): User {
    const userData = json['data'][0]

    return {
      id: userData.id,
      name: userData.name,
      displayName: userData.display_name,
      profileImageUrl: userData.profile_image_url,
    }
  }
}

export interface User {
  id: string
  name: string
  displayName: string
  profileImageUrl: string
}

export default new UserHelper()

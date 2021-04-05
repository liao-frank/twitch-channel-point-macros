import Api from '../util/Api'
import { Action, State } from '../util'
import { ActionType, StateKey, UserState } from '../../common/type'

class User {
  public state: State<UserState>

  constructor() {
    this.state = new State(StateKey.User)
    this.handleResponse = this.handleResponse.bind(this)

    Api.poll('helix/users', undefined, this.handleResponse)

    // Register actions.
    Action.handle(ActionType.UserFetch, () => this.fetch())
  }

  async fetch() {
    const response = await Api.call('helix/users')
    this.handleResponse(response)
  }

  private handleResponse(response) {
    const user = User.jsonToUser(response)
    this.state.update(user)
  }

  static jsonToUser(json): UserState {
    const userData = json['data'][0]

    return {
      id: userData.id,
      name: userData.name,
      displayName: userData.display_name,
      profileImageUrl: userData.profile_image_url,
    }
  }
}

export default new User()

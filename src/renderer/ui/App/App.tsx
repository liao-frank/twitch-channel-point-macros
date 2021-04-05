import { ipcRenderer } from 'electron'
import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Login from '~/ui/Login'
import Sequence from '~ui/Sequence'
import Sidebar from '~/ui/Sidebar'
import { ActionType } from '~/../common/type'

import twitchIconWhite from '~/asset/twitch-icon-transparent-white.png'
import './App.scss'

// TODO: Apply state interface.
interface AppState {
  tokens: null | undefined // `null` means tokens available.
}

class App extends React.Component<{}, any> {
  constructor(props) {
    super(props)

    this.state = {
      // ui
      didInit: false,
      selectedReward: undefined,
      // main
      tokens: undefined,
      user: undefined,
      rewards: undefined,
      sequences: undefined,
    }

    // Set-up state listener.
    ipcRenderer.on(ActionType.StateUpdate, (_, state) => {
      this.setState(state)
      console.log('`ipcRenderer.on(ActionType.StateUpdate` completed.', {
        state,
      })
    })

    // Get stored state.
    this.initalizeState()
  }

  render() {
    const {
      didInit,
      selectedReward: selectedRewardId,
      tokens,
      user,
      rewards,
      sequences,
    } = this.state
    const selectedSequence = sequences?.[selectedRewardId]
    const selectedReward = rewards?.find(
      (reward) => reward.id === selectedRewardId
    )

    return (
      <div className="c886">
        {tokens === undefined ? (
          <Login didInit={didInit} />
        ) : (
          <div className="d-flex h-100 flex-column">
            <Topbar user={user} />
            <div className="d-flex flex-fill" style={{ overflow: 'hidden' }}>
              <Sidebar
                selectedReward={selectedRewardId}
                user={user}
                rewards={rewards}
                selectReward={this.selectReward.bind(this)}
              />
              <div className="flex-fill" style={{ overflow: 'auto' }}>
                {selectedReward && selectedSequence && (
                  <Sequence
                    reward={selectedReward}
                    sequence={selectedSequence}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  async initalizeState() {
    const hasValidTokens = await ipcRenderer.invoke(ActionType.TokensValidate)
    let initialState = {}
    // If valid tokens exist, assume user was previously logged in and retrieve state.
    if (hasValidTokens) {
      initialState = await ipcRenderer.invoke(ActionType.StateRead)
    }
    this.setState({ didInit: true, ...initialState })
    console.log('`initalizeState` completed.', { hasValidTokens, initialState })
  }

  componentDidUpdate(_, prevState) {
    // If just logged in, immediately fetch Twitch data.
    if (prevState.tokens === undefined && this.state.tokens === null) {
      // NOTE: Certain state (e.g. rewards) requires a valid user to be fetched first.
      ipcRenderer
        .invoke(ActionType.UserFetch)
        .then(() => ipcRenderer.invoke(ActionType.RewardsFetch))
        .then(() => this.initalizeState())
    }
  }

  private async selectReward(rewardId) {
    const sequence = this.state.sequences?.[rewardId]
    if (!sequence) {
      ipcRenderer.invoke(ActionType.SequenceSet, { rewardId, actions: [] })
    }
    this.setState({ selectedReward: rewardId })
  }
}

const Topbar = ({ user }) => {
  return (
    <Navbar bg="primary" variant="dark">
      <Container fluid>
        <Navbar.Brand className="display-1">
          <img className="twitch-icon" src={twitchIconWhite} />
          Channel Point Macros
        </Navbar.Brand>
        <Nav>
          <NavDropdown
            title={
              <>
                <Image
                  className="profile-icon"
                  src={user?.profileImageUrl}
                  thumbnail
                />
                <span className="display-name">{user?.displayName}</span>
              </>
            }
            id="collasible-nav-dropdown"
          >
            <NavDropdown.Item disabled>Settings</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item
              onClick={() => ipcRenderer.invoke(ActionType.TokensRevoke)}
            >
              Log out
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  )
}

export default App

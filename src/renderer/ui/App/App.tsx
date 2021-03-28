import { ipcRenderer, shell } from 'electron'
import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'

import Login from '~/ui/Login'
import Sidebar from '~/ui/Sidebar'

import twitchIconWhite from '~/asset/twitch-icon-transparent-white.png'
import './App.scss'
import Sequence from '~ui/Sequence'

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
      // main process
      tokens: undefined,
      user: undefined,
      rewards: undefined,
      sequences: undefined,
    }

    // Set-up state listener.
    ipcRenderer.on('state', (_, state) => {
      console.log('Received state event', state)
      this.setState(state)
    })

    // Get stored state.
    this.initState()
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

  async initState() {
    const tokens = await ipcRenderer.invoke('get-tokens')
    let user
    let rewards
    let sequences
    // If valid tokens exist, assume user was previously logged in and retrieve other state.
    if (tokens !== undefined) {
      ;[user, rewards, sequences] = await Promise.all([
        ipcRenderer.invoke('get-user'),
        ipcRenderer.invoke('get-rewards'),
        ipcRenderer.invoke('get-sequences'),
      ])
    }
    this.setState({ didInit: true, tokens, user, rewards, sequences }, () => {
      console.log('Initialized state', this.state)
    })
  }

  componentDidUpdate(_, prevState) {
    if (prevState.tokens === undefined && this.state.tokens === null) {
      // NOTE: Certain state (e.g. rewards) requires a valid user to be fetched first.
      ipcRenderer
        .invoke('fetch-user')
        .then(() => ipcRenderer.invoke('fetch-rewards'))
        .then(() => this.initState())
    }
  }

  private async selectReward(rewardId) {
    const sequence = this.state.sequences[rewardId]
    if (!sequence) {
      ipcRenderer.invoke('set-sequences', { rewardId })
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
            <NavDropdown.Item onClick={logOut}>Log out</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  )
}

const logOut = () => {
  ipcRenderer.invoke('revoke-tokens')
}

export default App

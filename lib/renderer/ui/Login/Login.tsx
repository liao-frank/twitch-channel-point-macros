import { ipcRenderer } from 'electron'
import * as React from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import spaceship from '~/asset/spaceship.gif'
import twitchIconWhite from '~/asset/twitch-icon-transparent-white.png'
import twitchLogoPurple from '~/asset/twitch-logo-white-purple.png'

import './Login.scss'

const Login = () => {
  return (
    <div
      className="b1e1 d-flex h-100 align-items-center justify-content-center"
      style={{ backgroundImage: `url(${spaceship})` }}
    >
      <Card className="text-center" style={{ width: 360 }}>
        <div
          className="background"
          style={{ backgroundImage: `url(${spaceship})` }}
        ></div>
        <Card.Header className="display-1">
          <img className="logo" src={twitchLogoPurple} />
          Channel Point Macros
        </Card.Header>
        <Card.Body>
          <Button variant="primary" onClick={logIn}>
            <div className="d-flex align-items-center">
              <img className="icon" src={twitchIconWhite} />
              <div className="divider"></div>
              Sign in
            </div>
          </Button>
        </Card.Body>
      </Card>
    </div>
  )
}

const logIn = async () => {
  return await ipcRenderer.invoke('fetch-tokens')
}

export default Login

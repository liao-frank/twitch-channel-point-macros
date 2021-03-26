import { ipcRenderer } from 'electron'
import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Login from '~/ui/Login'

class App extends React.Component<{}, any> {
  constructor(props) {
    super(props)

    this.state = {
      user: {},
      rewards: [],
      redemptions: [],
    }

    // Set-up state listener.
    ipcRenderer.on('state', (_, state) => {
      debugger
      this.setState(state)
    })
  }

  render() {
    const { user } = this.state
    return user.id ? <Topbar /> : <Login />
  }
}

const Topbar = () => {
  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand>Channel Points Controller</Navbar.Brand>
      </Container>
      <Nav>
        <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
          <NavDropdown.Item>Settings</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item>Log out</NavDropdown.Item>
        </NavDropdown>
      </Nav>
    </Navbar>
  )
}

export default App

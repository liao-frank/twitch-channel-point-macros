import { ipcRenderer } from 'electron'
import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Login from '~/ui/Login'

// TODO: Apply this interface.
interface AppState {
  tokens: null | undefined // `null` means tokens available.
}

class App extends React.Component<{}, any> {
  constructor(props) {
    super(props)

    this.state = {}

    // Set-up state listener.
    ipcRenderer.on('state', (_, state) => {
      this.setState(state)
    })
  }

  render() {
    const { tokens } = this.state
    return tokens === undefined ? <Login /> : <Topbar />
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

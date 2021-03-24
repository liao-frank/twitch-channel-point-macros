import * as React from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'

// TODO: Move types to 'lib/common'.
type AppState = {
  user: any
  rewards: any
  redemptions: any
}

class App extends React.Component<{}, AppState> {
  constructor(props) {
    super(props)

    this.state = {
      user: {},
      rewards: [],
      redemptions: [],
    }
  }

  render() {
    const {user} = this.state
    return (
      user.id ?
        <Topbar /> :
        <Login />
    )
  }
}

const Login = () => {
  return <Container></Container>
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

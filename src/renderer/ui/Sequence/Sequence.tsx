import { ipcRenderer, shell } from 'electron'
import * as React from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Tooltip from 'react-bootstrap/Tooltip'

import './Sequence.scss'

const Sequence = ({ reward, sequence }) => {
  const { id: rewardId, title, prompt } = reward
  const { enabled } = sequence
  const actions = sequence.actions || []

  const enabledSwitchId = `enabled-switch-${rewardId}`

  return (
    <Container className="c771 p-4">
      <div className="d-flex">
        <div className="flex-fill">
          <h1 className="display-1 fs-3">{title}</h1>
          {prompt && <p className="w-75 mb-0">{prompt}</p>}
        </div>
        <div className="align-self-center">
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip className="me-2">Trigger manually for testing.</Tooltip>
            }
          >
            <i
              className="bi bi-play-circle text-muted"
              onClick={() => ipcRenderer.invoke('trigger-sequences', rewardId)}
            ></i>
          </OverlayTrigger>
        </div>
      </div>

      <hr />
      <div className="form-check form-switch d-flex align-items-center mb-3">
        <input
          className="form-check-input mt-0 me-2"
          type="checkbox"
          id={enabledSwitchId}
          checked={!!enabled}
          onChange={() => setSequence(sequence, { enabled: !enabled })}
        />
        <label className="form-check-label " htmlFor={enabledSwitchId}>
          Listen for redemptions.
        </label>
      </div>
      <Form.Label className="text-muted">
        Run macros only when the selected application is open.
      </Form.Label>
      <Form.Control className="text-muted" as="select" disabled>
        <option>Unavailable</option>
      </Form.Control>
      <hr />
      <Form.Label className={actions.length ? 'mb-4' : 'mb-2'}>
        Run the following actions in-order on redemption.
      </Form.Label>
      {actions.length ? (
        // TODO: Find a better alternative for the action key.
        actions.map((action, index) => (
          <Action
            key={index}
            sequence={sequence}
            action={action}
            index={index}
          />
        ))
      ) : (
        <p className="text-muted">
          There are no actions in this sequence yet. Add actions with the
          buttons below.
        </p>
      )}
      <div className="add-action-buttons d-flex align-items-center justify-content-end">
        <Button
          className="rounded-pill me-2"
          onClick={() =>
            addAction(sequence, { delay: 0, keys: '', modifierKey: '' })
          }
        >
          <i className="bi bi-plus"></i>
          <i className="bi bi-keyboard me-1"></i>
        </Button>
        <Button
          className="rounded-pill"
          onClick={() => addAction(sequence, { delay: 0, command: '' })}
        >
          <i className="bi bi-plus"></i>
          <i className="bi bi-terminal me-2"></i>
        </Button>
      </div>
    </Container>
  )
}

const Action = ({ sequence, action, index }) => {
  const { delay, keys, modifierKey, command } = action
  const getUpdater = (key, map = (_) => _) => (evt) =>
    updateAction(sequence, index, {
      [key]: map(evt.target.value),
    })

  return (
    <div className="action d-flex align-items-center mb-4">
      <Form.Group className="action-delay-group me-3" controlId="actionDelay">
        <Form.Label>Delay (ms)</Form.Label>
        <Form.Control
          type="text"
          value={delay}
          onChange={getUpdater('delay', (val) => parseInt(val, 10) || 0)}
        />
      </Form.Group>
      {(() => {
        if (keys !== undefined) {
          return (
            <>
              <Form.Group
                className="action-modifier-key-group me-3"
                controlId="actionModifierKey"
              >
                <Form.Label>
                  Modifier{' '}
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={
                      <Popover id="popover-modifier" className="mb-1" rootClose>
                        <Popover.Title as="h3">Modifiers</Popover.Title>
                        <Popover.Content>
                          Modifier keys are only applied when typing a single
                          character or special character.
                        </Popover.Content>
                      </Popover>
                    }
                  >
                    <i className="bi bi-info-circle text-muted"></i>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  as="select"
                  value={modifierKey}
                  onChange={getUpdater('modifierKey')}
                >
                  <option value="">none</option>
                  <option value="command">cmd</option>
                  <option value="control">ctrl</option>
                  <option>alt</option>
                  <option>shift</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="flex-fill me-3" controlId="actionKeys">
                <Form.Label>
                  Keypresses{' '}
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={
                      <Popover
                        id="popover-keypresses"
                        className="mb-1"
                        rootClose
                      >
                        <Popover.Title as="h3">Keypresses</Popover.Title>
                        <Popover.Content>
                          <div className="mb-2">
                            Start the phrase with{' '}
                            <span className="fst-italic fw-light">key:</span> to
                            type a special character instead. For example,{' '}
                            <span className="fst-italic fw-light">key:f8</span>{' '}
                            would press the F8 key.
                          </div>
                          <div>
                            See{' '}
                            <a
                              href="#"
                              onClick={() =>
                                shell.openExternal(
                                  'https://robotjs.io/docs/syntax#keys'
                                )
                              }
                            >
                              this table
                            </a>{' '}
                            for special characters.
                          </div>
                        </Popover.Content>
                      </Popover>
                    }
                  >
                    <i className="bi bi-info-circle text-muted"></i>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={keys}
                  placeholder="A phrase to type."
                  onChange={getUpdater('keys')}
                />
              </Form.Group>
            </>
          )
        } else if (command !== undefined) {
          return (
            <Form.Group className="flex-fill me-3" controlId="actionCommand">
              <Form.Label>Command</Form.Label>
              <Form.Control type="text" onChange={getUpdater('command')} />
            </Form.Group>
          )
        }
      })()}
      <div
        className="remove-action align-self-end rounded-circle"
        onClick={() => removeAction(sequence, index)}
      >
        <i className="text-muted bi bi-trash"></i>
      </div>
    </div>
  )
}

const addAction = (sequence, action) => {
  const actions = [...(sequence.actions || [])] || []
  actions.push(action)
  setSequence(sequence, { actions })
}

const removeAction = (sequence, index) => {
  const actions = [...(sequence.actions || [])] || []
  actions.splice(index, 1)
  setSequence(sequence, { actions })
}

const updateAction = (sequence, index, next) => {
  const actions = [...(sequence.actions || [])] || []
  if (index < actions.length) {
    actions[index] = { ...actions[index], ...next }
    setSequence(sequence, { actions })
  }
}

// Assigns new fields to the given sequence then updates it. Similar to `setState`.
const setSequence = (sequence, next) => {
  const nextSequence = {
    ...sequence,
    ...next,
  }
  ipcRenderer.invoke('set-sequences', nextSequence)
}

export default Sequence

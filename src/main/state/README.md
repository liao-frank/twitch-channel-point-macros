# State

'State' in TCPM refers to JSON in the main process that is persisted by the `electron-store` module. It does **not** refer to React state; however, the `State` util provides methods for syncing the main process' state to React state.

## Actions
The `State` util provides electron action bindings that can be invoked from the renderer process.

```ts
// Listen for state updates.
ipcRenderer.on(Action.StateUpdate, (_, state) => {
  this.setState(state)
})

const user = await ipcRenderer.invoke(Action.StateRead, State.User)
const state = await ipcRenderer.invoke(Action.StateRead)

// Update the state with a new value.
ipcRender.invoke(Action.StateUpdate, State.User, user)
```

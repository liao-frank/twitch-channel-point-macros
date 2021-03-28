import { BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import { isEqual, kebabCase } from 'lodash'
import Window from './Window'

export const store = new Store()
const keys = new Set()

class State<T> {
  private readonly key: string

  constructor(key) {
    this.key = key

    // Prevent duplicate keys.
    if (keys.has(this.key)) {
      throw Error(`Duplicate state for key '${this.key}'.`)
    }
    keys.add(this.key)

    // Set-up state listener.
    Window.addListener((win: BrowserWindow) => {
      store.onDidChange(this.key, async (state) => {
        if (this.key === 'tokens' && state) {
          state = null
        }
        win.webContents.send('state', {
          [this.key]: state,
        })
      })
    })
  }

  // Registers an IPC action handler. This clears old handlers for the given prefix.
  action(prefix: string, handler) {
    const action = `${prefix.toLowerCase()}-${kebabCase(this.key)}`
    // Clear pre-existing handlers.
    ipcMain.removeHandler(action)
    // Register new handler.
    ipcMain.handle(action, handler)
  }

  get(): T {
    return store.get(this.key) as T
  }

  set(next: T) {
    const curr = this.get()

    if (!isEqual(curr, next)) {
      store.set(this.key, next)
    }
  }

  delete() {
    store.delete(this.key)
  }
}

export default State

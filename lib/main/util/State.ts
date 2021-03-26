import { BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import { kebabCase } from 'lodash'
import Window from './Window'

const store = new Store()
const keys = new Set()

class State<T> {
  private readonly key: string

  constructor(instance) {
    this.key = instance.constructor.key

    // Prevent duplicate keys.
    if (keys.has(this.key)) {
      throw Error(`Duplicate state for key '${this.key}'.`)
    }
    keys.add(this.key)

    // Set-up state listener.
    Window.addListener((win: BrowserWindow) => {
      store.onDidChange(this.key, async (state) => {
        if (this.key === 'tokens') {
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
    store.set(this.key, next)
  }

  delete() {
    store.delete(this.key)
  }
}

export default State

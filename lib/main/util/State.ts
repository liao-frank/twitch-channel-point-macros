import { ipcMain } from 'electron'
import Store from 'electron-store'
import { kebabCase } from 'lodash'

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

    // Register default handlers.
    this.action('get', () => this.get())
    this.action('set', (_, next: T) => this.set(next))
    this.action('delete', () => this.delete())
    if (instance.fetch) {
      this.action('fetch', () => instance.fetch())
    }
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

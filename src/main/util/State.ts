import { BrowserWindow } from 'electron'
import Store from 'electron-store'
import { isEqual } from 'lodash'
import Action from './Action'
import Window from './Window'
import { ActionType } from '../../common/type'

// Encrypt with key for obscurity only.
export const store = new Store({
  encryptionKey: '27996d86-1b75-4f68-95eb-c2d26885f016',
})
const keys = new Set()

// Register actions.
Action.handle(ActionType.StateRead, (key) => {
  if (key) {
    return store.get(key)
  }
  return store.store
})

class State<T> {
  private readonly key: string

  private currentWindow?: BrowserWindow

  constructor(key) {
    this.key = key

    // Check for duplicate keys.
    if (keys.has(this.key)) {
      console.error(`Duplicate state for key '${this.key}'.`)
      process.exit()
    }
    keys.add(this.key)

    Window.onUpdateImmediate((window) => (this.currentWindow = window))

    // Set-up state synchronization when the window is ready.
    store.onDidChange(this.key, () => this.emitUpdate())
  }

  read(): T | undefined {
    return store.get(this.key) as T
  }

  // Returns a promise that resolves when the value is defined.
  async readDefined(): Promise<T> {
    return new Promise((resolve) => {
      this.onUpdateImmediate((value, dispose) => {
        if (value !== undefined) {
          resolve(value)
          dispose()
        }
      })
    })
  }

  // Applies a handler to all values now and in the future.
  onUpdateImmediate(
    handler: (value: T | undefined, dispose: () => void) => void
  ): () => {} {
    const dispose = store.onDidChange(this.key, (value: T | undefined) =>
      handler(value, dispose)
    )

    const curr = this.read()
    if (curr !== undefined) {
      handler(curr, dispose)
    }
    return dispose
  }

  // Set the given value to the store if it is different.
  update(next: T) {
    const curr = this.read()

    if (!isEqual(curr, next)) {
      store.set(this.key, next)
    }
  }

  delete() {
    store.delete(this.key)
  }

  private emitUpdate() {
    let curr: T | undefined | null = this.read()

    // Exceptional filter for tokens, so they don't appear in the renderer process.
    if (this.key === 'tokens' && curr !== undefined) {
      curr = null
    }

    this.currentWindow?.webContents.send(ActionType.StateUpdate, {
      [this.key]: curr,
    })
  }
}

export default State

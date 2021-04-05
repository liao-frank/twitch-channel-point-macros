import { app, BrowserWindow } from 'electron'
import PromiseManager from './PromiseManager'
import { WINDOW_OPTIONS } from '../const/app'

type WindowHandler = (window?: BrowserWindow) => void

class Window {
  private readonly handlers = new Set<WindowHandler>()

  private windowManager?: PromiseManager<BrowserWindow>

  constructor() {
    // Prevent multiple instances.
    if (!app.requestSingleInstanceLock()) {
      console.error('Could not acquire single instance lock.')
      process.exit()
    }

    // Re-focus the first instance if a second one is trying to exist.
    app.on('second-instance', () => {
      if (this.windowManager?.fulfilled) {
        const window = this.windowManager!.value!
        if (window.isMinimized()) window.restore()
        window.focus()
      }
    })

    this.listen()
    app.on('window-all-closed', () => this.listen())
  }

  async create() {
    await app.whenReady()
    const window = new BrowserWindow(WINDOW_OPTIONS)

    window.loadFile(FILE_PATH)
    this.windowManager!.short(window)
    return window
  }

  // Applies a handler to all windows now and in the future.
  onUpdateImmediate(handler: WindowHandler) {
    if (this.windowManager?.fulfilled) {
      const window = this.windowManager!.value!
      handler(window)
    }

    this.handlers.add(handler)
  }

  // Sets up for the next available window.
  private async listen() {
    this.windowManager = PromiseManager.dependent()

    this.handlers.forEach((func) => func())
    const window = await this.windowManager.promise
    this.handlers.forEach((func) => func(window))
  }
}

const FILE_PATH = __dirname + '/../../renderer/dist/index.html'

export default new Window()

import { app, BrowserWindow } from 'electron'
import PromiseManager from './PromiseManager'
import { NAME } from '../const/app'

type WindowListener = (window: BrowserWindow) => void

class Window {
  private currWinManager?: PromiseManager<BrowserWindow>
  private currWinPromise?: Promise<BrowserWindow>
  private listeners = new Set<WindowListener>()

  constructor() {
    this.await()
    app.on('window-all-closed', this.await.bind(this))
  }

  async create() {
    await app.whenReady()
    const win = new BrowserWindow({
      title: NAME,
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    })

    win.loadFile(__dirname + '/../../renderer/dist/index.html')
    this.currWinManager!.short(win)
    return win
  }

  // Applies a callback to the current window and future windows.
  addListener(listener: WindowListener) {
    this.currWinPromise!.then(listener)
    this.listeners.add(listener)
  }

  private await() {
    this.currWinManager = PromiseManager.dependent()
    this.currWinPromise = this.currWinManager.promise

    this.listeners.forEach(async (listener) => {
      const currWin = await this.currWinPromise
      listener(currWin!)
    })
  }
}

export default new Window()

import { ipcMain } from 'electron'

class Action {
  static handle(action: string, handler) {
    ipcMain.handle(action, (_, ...args) => {
      return handler(...args)
    })
  }
}

export default Action

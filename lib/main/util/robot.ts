import cmd from 'node-cmd'
import psList from 'ps-list'
import robot from 'robotjs'
import Store from 'electron-store'

const store = new Store()

class Robot {
  // Returns whether or not the trigger passed its conditions and performed its sequence.
  async trigger(id: string) {
    const sequence = store.get(id) as Sequence
    if (sequence.openedApp) {
      const openProcesses = await this.getOpenProcesses()
      if (!openProcesses.includes(sequence.openedApp)) {
        return false
      }
    }
    this.performSequence(sequence)
    return true
  }

  set(id: string, sequence: Sequence) {
    store.set(id, sequence)
  }

  unset(id: string) {
    store.delete(id)
  }

  // Returns deduped list of open processes.
  private async getOpenProcesses() {
    const list = await psList()
    const dedupedList = list
      .reduce((acc, curr) => {
        if (!acc.includes(curr.name)) {
          acc.push(curr.name)
        }
        return acc
      }, [])
      .sort()
    return dedupedList
  }

  private async perform(action: Action) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (action.modifierKey) {
          console.log(action, action.key, action.modifierKey)
          robot.keyTap(action.key, action.modifierKey)
        } else if (action.key) {
          robot.keyTap(action.key)
        } else if (action.string) {
          robot.typeString(action.string)
        } else if (action.command) {
          cmd.run(action.command, /* callback: */ () => {})
        }
        resolve()
      }, action.delay || 0)
    })
  }

  private async performSequence(sequence: Sequence) {
    for (const action of sequence.actions) {
      await this.perform(action)
    }
  }
}

interface Action {
  delay?: number
  key?: string
  string?: string
  modifierKey?: string
  command?: string
}

interface Sequence {
  actions: Action[]
  openedApp?: string
}

export default new Robot()

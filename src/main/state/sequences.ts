import cmd from 'node-cmd'
import psList from 'ps-list'
import robot from 'robotjs'
import State from '../util/State'

class SequencesHelper {
  private state: State<Sequences>

  constructor() {
    this.state = new State('sequences')

    this.state.action('get', () => this.get())
    this.state.action('set', (_, sequence) => this.set(sequence))
    this.state.action('trigger', (_, rewardId) => this.trigger(rewardId, true))
  }

  get(): Sequences | undefined {
    return this.state.get()
  }

  set(sequence: Sequence) {
    const sequences = this.get() || {}
    sequences[sequence.rewardId] = sequence
    this.state.set(sequences)
  }

  // Returns whether or not the trigger passed its conditions and performed its sequence.
  async trigger(rewardId: string, overrideEnabled = false) {
    const sequence = this.state.get()[rewardId]

    if (!sequence) return
    if (!overrideEnabled && !sequence.enabled) return

    // TODO: Implement.
    if (/* sequence.openedApp */ false) {
      const openProcesses = await SequencesHelper.getOpenProcesses()
      if (!openProcesses.includes(sequence.openedApp)) {
        return false
      }
    }

    for (const action of sequence.actions) {
      await this.executeAction(action)
    }
    return true
  }

  private async executeAction(action: Action) {
    const { delay, keys, modifierKey, command } = action

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (keys) {
          // TODO: Move escape code to common directory.
          if (keys.startsWith('key:') || keys.length === 1) {
            const key = keys.replace('key:', '').toLowerCase()
            if (modifierKey) {
              robot.keyTap(key, modifierKey)
            } else {
              robot.keyTap(key)
            }
          } else {
            robot.typeString(keys)
          }
        } else if (command) {
          cmd.run(command, /* callback: */ () => {})
        }
        resolve()
      }, delay)
    })
  }

  // Returns deduped list of open processes.
  private static async getOpenProcesses() {
    const list = await psList()
    const dedupedList = list
      .reduce((acc: any[], curr) => {
        if (!acc.includes(curr.name)) {
          acc.push(curr.name)
        }
        return acc
      }, [])
      .sort()
    return dedupedList
  }
}

interface Action {
  delay: number
  keys?: string
  modifierKey?: string
  command?: string
}

interface Sequence {
  enabled: boolean
  rewardId: string
  actions: Action[]
  openedApp?: string
}

type Sequences = {
  [rewardId: string]: Sequence
}

export default new SequencesHelper()

import cmd from 'node-cmd'
import psList from 'ps-list'
import robot from 'robotjs'
import { Action, State } from '../util'
import {
  ActionType,
  SequenceState,
  SequenceActionState,
  SequencesState,
  StateKey,
} from '../../common/type'

class SequencesHelper {
  private state: State<SequencesState>

  constructor() {
    this.state = new State(StateKey.Sequences)

    Action.handle(ActionType.SequenceSet, (sequence) => this.set(sequence))
    Action.handle(ActionType.SequenceTrigger, (rewardId) =>
      this.trigger(rewardId, true)
    )
  }

  set(sequence: SequenceState) {
    const sequences = this.state.read() || {}
    sequences[sequence.rewardId] = sequence
    this.state.update(sequences)
  }

  // Returns whether or not the trigger passed its conditions and performed its sequence.
  async trigger(rewardId: string, overrideEnabled = false) {
    const sequences = await this.state.readDefined()
    const sequence = sequences[rewardId]

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

  private async executeAction(action: SequenceActionState) {
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

export default new SequencesHelper()

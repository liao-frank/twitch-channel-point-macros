// These should match the expected field names in React.
export enum StateKey {
  Rewards = 'rewards',
  Sequences = 'sequences',
  Tokens = 'tokens',
  User = 'user',
}

// Rewards.
export interface ImageSet {
  url_1x: string
  url_2x: string
  url_4x: string
}

export interface RewardState {
  id: string
  title: string
  prompt: string
  image?: ImageSet
  backgroundColor: string
  defaultImage: ImageSet
}

export type RewardsState = RewardState[]

// Sequences.
export interface SequenceActionState {
  delay: number
  keys?: string
  modifierKey?: string
  command?: string
}

export interface SequenceState {
  enabled: boolean
  rewardId: string
  actions: SequenceActionState[]
  openedApp?: string
}

export type SequencesState = {
  [rewardId: string]: SequenceState
}

// User.
export interface UserState {
  id: string
  name: string
  displayName: string
  profileImageUrl: string
}

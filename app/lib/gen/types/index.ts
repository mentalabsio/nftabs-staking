import * as WhitelistType from "./WhitelistType"

export { LockConfig } from "./LockConfig"
export type { LockConfigFields, LockConfigJSON } from "./LockConfig"
export { Reward } from "./Reward"
export type { RewardFields, RewardJSON } from "./Reward"
export { Buff } from "./Buff"
export type { BuffFields, BuffJSON } from "./Buff"
export { WhitelistType }

export type WhitelistTypeKind =
  | WhitelistType.Creator
  | WhitelistType.Mint
  | WhitelistType.Buff
export type WhitelistTypeJSON =
  | WhitelistType.CreatorJSON
  | WhitelistType.MintJSON
  | WhitelistType.BuffJSON

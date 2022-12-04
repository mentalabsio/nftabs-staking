import { BN } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"

import { StakeArgs } from "./gen/instructions/stake"
import { WhitelistTypeKind } from "./gen/types"
import { LockConfigFields } from "./gen/types/LockConfig"

export type TripEffect =
  | "None"
  | "Groovy"
  | "Geometric"
  | "Drip"
  | "Interdimensional"
  | "2x"
  | "3x"
  | "4x"
  | "Nirvana"

export type TripMap = {
  [K in TripEffect]: number
}

export interface ICreateFarm {
  authority: PublicKey
  rewardMint: PublicKey
}

export interface IAddToWhitelist {
  farm: PublicKey
  creatorOrMint: PublicKey
  authority: PublicKey
  whitelistType: WhitelistTypeKind
  rewardRate: {
    tokenAmount: number
    intervalInSeconds: number
  }
}

export interface IRemoveFromWhitelist {
  farm: PublicKey
  addressToRemove: PublicKey
  authority: PublicKey
}

export interface ICreateLocks {
  lockConfigs: LockConfigFields[]
  farm: PublicKey
  authority: PublicKey
}

export interface IFundReward {
  amount: number
  farm: PublicKey
  authority: PublicKey
}

export interface IAddManager {
  farm: PublicKey
  newManagerAuthority: PublicKey
  farmAuthority: PublicKey
}

export interface IInitializeFarmer {
  farm: PublicKey
  owner: PublicKey
}

export interface IStake {
  farm: PublicKey
  mint: PublicKey
  lock: PublicKey
  args: Omit<StakeArgs, "level"> & { tripEffect: TripEffect }
  owner: PublicKey
}

export interface IUnstake {
  farm: PublicKey
  mint: PublicKey
  owner: PublicKey
}

export interface IBuffPair {
  farm: PublicKey
  buffMint: PublicKey
  pair: [PublicKey, PublicKey]
  authority: PublicKey
}

export interface IDebuffPair {
  farm: PublicKey
  buffMint: PublicKey
  pair: [PublicKey, PublicKey]
  authority: PublicKey
}

export interface IClaimRewards {
  farm: PublicKey
  authority: PublicKey
}

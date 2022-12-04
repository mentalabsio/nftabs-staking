import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UnstakeAccounts {
  farm: PublicKey
  farmer: PublicKey
  gemMint: PublicKey
  stakeReceipt: PublicKey
  lock: PublicKey
  farmerVault: PublicKey
  gemOwnerAta: PublicKey
  owner: PublicKey
  tokenProgram: PublicKey
}

export function unstake(accounts: UnstakeAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.farm, isSigner: false, isWritable: true },
    { pubkey: accounts.farmer, isSigner: false, isWritable: true },
    { pubkey: accounts.gemMint, isSigner: false, isWritable: false },
    { pubkey: accounts.stakeReceipt, isSigner: false, isWritable: true },
    { pubkey: accounts.lock, isSigner: false, isWritable: false },
    { pubkey: accounts.farmerVault, isSigner: false, isWritable: true },
    { pubkey: accounts.gemOwnerAta, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: true, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([90, 95, 107, 42, 205, 124, 50, 225])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}

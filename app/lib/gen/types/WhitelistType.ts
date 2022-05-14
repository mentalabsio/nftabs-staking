import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface CreatorJSON {
  kind: "Creator"
}

export class Creator {
  readonly discriminator = 0
  readonly kind = "Creator"

  toJSON(): CreatorJSON {
    return {
      kind: "Creator",
    }
  }

  toEncodable() {
    return {
      Creator: {},
    }
  }
}

export interface MintJSON {
  kind: "Mint"
}

export class Mint {
  readonly discriminator = 1
  readonly kind = "Mint"

  toJSON(): MintJSON {
    return {
      kind: "Mint",
    }
  }

  toEncodable() {
    return {
      Mint: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.WhitelistTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("Creator" in obj) {
    return new Creator()
  }
  if ("Mint" in obj) {
    return new Mint()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(
  obj: types.WhitelistTypeJSON
): types.WhitelistTypeKind {
  switch (obj.kind) {
    case "Creator": {
      return new Creator()
    }
    case "Mint": {
      return new Mint()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Creator"),
    borsh.struct([], "Mint"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}

import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface CreatorJSON {
  kind: "Creator"
}

export class Creator {
  static readonly discriminator = 0
  static readonly kind = "Creator"
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
  static readonly discriminator = 1
  static readonly kind = "Mint"
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

export interface BuffJSON {
  kind: "Buff"
}

export class Buff {
  static readonly discriminator = 2
  static readonly kind = "Buff"
  readonly discriminator = 2
  readonly kind = "Buff"

  toJSON(): BuffJSON {
    return {
      kind: "Buff",
    }
  }

  toEncodable() {
    return {
      Buff: {},
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
  if ("Buff" in obj) {
    return new Buff()
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
    case "Buff": {
      return new Buff()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Creator"),
    borsh.struct([], "Mint"),
    borsh.struct([], "Buff"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}

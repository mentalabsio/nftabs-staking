export type CustomError =
  | CooldownIsNotOver
  | CouldNotReserveReward
  | CouldNotReleaseReward
  | GemStillLocked
  | GemStillStaked
  | GemNotStaked
  | GemAlreadyBuffed
  | GemNotBuffed
  | GemStillBuffed
  | InvalidWhitelistType
  | FactorMustBeGtZero
  | InvalidTripEffect
  | ArithmeticError

export class CooldownIsNotOver extends Error {
  readonly code = 6000
  readonly name = "CooldownIsNotOver"
  readonly msg = "Cooldown is not over yet."

  constructor() {
    super("6000: Cooldown is not over yet.")
  }
}

export class CouldNotReserveReward extends Error {
  readonly code = 6001
  readonly name = "CouldNotReserveReward"
  readonly msg = "Insufficient reward funds. Could not reserve."

  constructor() {
    super("6001: Insufficient reward funds. Could not reserve.")
  }
}

export class CouldNotReleaseReward extends Error {
  readonly code = 6002
  readonly name = "CouldNotReleaseReward"
  readonly msg = "Insufficient reserved reward. Could not release."

  constructor() {
    super("6002: Insufficient reserved reward. Could not release.")
  }
}

export class GemStillLocked extends Error {
  readonly code = 6003
  readonly name = "GemStillLocked"
  readonly msg = "Cannot unstake while the gem is still locked."

  constructor() {
    super("6003: Cannot unstake while the gem is still locked.")
  }
}

export class GemStillStaked extends Error {
  readonly code = 6004
  readonly name = "GemStillStaked"
  readonly msg = "Must unstake before staking again."

  constructor() {
    super("6004: Must unstake before staking again.")
  }
}

export class GemNotStaked extends Error {
  readonly code = 6005
  readonly name = "GemNotStaked"
  readonly msg = "Attempt to operate on a gem that is no longer staked."

  constructor() {
    super("6005: Attempt to operate on a gem that is no longer staked.")
  }
}

export class GemAlreadyBuffed extends Error {
  readonly code = 6006
  readonly name = "GemAlreadyBuffed"
  readonly msg = "This NFT is already being buffed."

  constructor() {
    super("6006: This NFT is already being buffed.")
  }
}

export class GemNotBuffed extends Error {
  readonly code = 6007
  readonly name = "GemNotBuffed"
  readonly msg = "This NFT was not buffed."

  constructor() {
    super("6007: This NFT was not buffed.")
  }
}

export class GemStillBuffed extends Error {
  readonly code = 6008
  readonly name = "GemStillBuffed"
  readonly msg = "The gem must be debuffed before realizing this operation."

  constructor() {
    super("6008: The gem must be debuffed before realizing this operation.")
  }
}

export class InvalidWhitelistType extends Error {
  readonly code = 6009
  readonly name = "InvalidWhitelistType"
  readonly msg = "Invalid whitelist type."

  constructor() {
    super("6009: Invalid whitelist type.")
  }
}

export class FactorMustBeGtZero extends Error {
  readonly code = 6010
  readonly name = "FactorMustBeGtZero"
  readonly msg = "Buff factor must be greater than 0."

  constructor() {
    super("6010: Buff factor must be greater than 0.")
  }
}

export class InvalidTripEffect extends Error {
  readonly code = 6011
  readonly name = "InvalidTripEffect"
  readonly msg = "Invalid trip effect. Values must be in range 1..5."

  constructor() {
    super("6011: Invalid trip effect. Values must be in range 1..5.")
  }
}

export class ArithmeticError extends Error {
  readonly code = 6012
  readonly name = "ArithmeticError"
  readonly msg = "An arithmetic error occurred."

  constructor() {
    super("6012: An arithmetic error occurred.")
  }
}

export function fromCode(code: number): CustomError | null {
  switch (code) {
    case 6000:
      return new CooldownIsNotOver()
    case 6001:
      return new CouldNotReserveReward()
    case 6002:
      return new CouldNotReleaseReward()
    case 6003:
      return new GemStillLocked()
    case 6004:
      return new GemStillStaked()
    case 6005:
      return new GemNotStaked()
    case 6006:
      return new GemAlreadyBuffed()
    case 6007:
      return new GemNotBuffed()
    case 6008:
      return new GemStillBuffed()
    case 6009:
      return new InvalidWhitelistType()
    case 6010:
      return new FactorMustBeGtZero()
    case 6011:
      return new InvalidTripEffect()
    case 6012:
      return new ArithmeticError()
  }

  return null
}

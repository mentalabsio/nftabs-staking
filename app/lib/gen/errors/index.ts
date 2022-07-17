import { PROGRAM_ID } from "../programId"
import * as anchor from "./anchor"
import * as custom from "./custom"

export function fromCode(
  code: number
): custom.CustomError | anchor.AnchorError | null {
  return code >= 6000 ? custom.fromCode(code) : anchor.fromCode(code)
}

function hasOwnProperty<X extends object, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.hasOwnProperty.call(obj, prop)
}

const errorRe =
  /failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: (\w+)/

export function fromTxError(
  err: unknown
): custom.CustomError | anchor.AnchorError | null {
  if (
    typeof err !== "object" ||
    err === null ||
    !hasOwnProperty(err, "message")
  ) {
    return null
  }

  /**
   * err.message = failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1773
   */
  const rexMessage = errorRe.exec((err && (err.message as string)) || "")

  if (rexMessage === null) {
    return null
  }

  const codeRaw = rexMessage[1]

  let errorCode: number
  try {
    errorCode = parseInt(codeRaw, 16)
  } catch (parseErr) {
    return null
  }

  return fromCode(errorCode)
}

import { useConnection } from "@solana/wallet-adapter-react"
import { StakeReceipt } from "lib/gen/accounts"
import { fromTxError } from "lib/gen/errors"
import { findAllStakeReceipts } from "lib/utils"
import { useCallback, useEffect, useState } from "react"

export const useTotalStaked = () => {
  const { connection } = useConnection()
  const [allStakeReceipts, setAllStakeReceipts] = useState<StakeReceipt[]>(null)

  const fetchAllStakeReceipts = useCallback(async () => {
    if (!allStakeReceipts) {
      try {
        const receipts = await findAllStakeReceipts(connection)

        const stakingReceipts = receipts.filter(
          (receipt) => receipt.endTs === null
        )

        setAllStakeReceipts(stakingReceipts)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    fetchAllStakeReceipts()
  }, [fetchAllStakeReceipts])

  const totalStaked = allStakeReceipts?.length

  return { totalStaked }
}

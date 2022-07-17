import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import { StakingProgram } from "lib"
import { findFarmAddress, findFarmerAddress } from "lib/pda"
import { findFarmLocks } from "lib/utils"
import { useState, useEffect, useCallback } from "react"

import { BN } from "@project-serum/anchor"
import { farmAuthorityPubKey, rewardMint } from "./useStaking"
import { Farmer } from "lib/gen/accounts"
import { fromTxError } from "lib/gen/errors"

export const useStakingFungible = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [feedbackStatus, setFeedbackStatus] = useState("")
  const [farmerAccount, setFarmerAccount] = useState<Farmer | false | null>(
    null
  )

  const fetchFarmer = useCallback(async () => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      setFeedbackStatus("Fetching farmer...")
      const farmer = findFarmerAddress({ farm, owner: publicKey })
      const farmerAccount = await Farmer.fetch(connection, farmer)

      if (!farmerAccount) {
        setFeedbackStatus("")
        setFarmerAccount(false)

        return true
      }

      setFarmerAccount(farmerAccount)
      setFeedbackStatus("")
    } catch (e) {
      setFeedbackStatus("Something went wrong. " + (e.message ? e.message : e))
    }
  }, [publicKey])

  useEffect(() => {
    if (publicKey) {
      fetchFarmer()
    }
  }, [connection, publicKey])

  /**
   *
   * @param amount Raw amount with no decimals
   */
  const stakeFungibleTokens = async (amount: number) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const locks = await findFarmLocks(connection, farm)
      const lock = locks.find((lock) => lock.bonusFactor === 0)

      const stakingClient = StakingProgram(connection)

      console.log(amount)
      // Stake 0.5 tokens
      const { ix } = await stakingClient.createStakeInstruction({
        farm,
        mint: rewardMint,
        lock: lock.address,
        owner: publicKey,
        args: { amount: new BN(amount * 1000000000), tripEffect: "None" },
      })

      const tx = new Transaction()

      tx.add(ix)
      const latest = await connection.getLatestBlockhash()
      tx.recentBlockhash = latest.blockhash
      tx.feePayer = publicKey

      setFeedbackStatus("Awaiting approval...")

      const txid = await sendTransaction(tx, connection)

      setFeedbackStatus("Confirming...")

      await connection.confirmTransaction(txid)

      setFeedbackStatus("Success!")
    } catch (e) {
      const message = fromTxError(e)

      setFeedbackStatus(
        "Something went wrong. " + (message ? message : e.message || e)
      )
    }
  }

  const initFarmer = async () => {
    try {
      const stakingClient = StakingProgram(connection)

      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      setFeedbackStatus("Initializing transaction...")
      const { ix } = await stakingClient.createInitializeFarmerInstruction({
        farm,
        owner: publicKey,
      })

      const latest = await connection.getLatestBlockhash()
      const tx = new Transaction()

      tx.recentBlockhash = latest.blockhash
      tx.add(ix)

      tx.feePayer = publicKey

      setFeedbackStatus("Awaiting approval...")
      const txid = await sendTransaction(tx, connection)

      await connection.confirmTransaction(txid)

      setFeedbackStatus("Success!")

      await fetchFarmer()
    } catch (e) {
      setFeedbackStatus("Something went wrong. " + (e.message ? e.message : e))
    }
  }

  return {
    /** Same from @file ./useStaking */
    initFarmer,
    stakeFungibleTokens,
    feedbackStatus,
    /** Same from @file ./useStaking */
    farmerAccount,
  }
}

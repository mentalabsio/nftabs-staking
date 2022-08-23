import { web3, BN } from "@project-serum/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"

import { StakingProgram } from "lib"
import { Farmer, StakeReceipt } from "lib/gen/accounts"
import { findFarmAddress, findFarmerAddress } from "lib/pda"
import { findFarmLocks, findUserStakeReceipts } from "lib/utils"
import { getNFTMetadata } from "utils/nfts"
import { NFT } from "./useWalletNFTs"
import { Lock } from "lib/gen/accounts/Lock"
import { fromTxError } from "lib/gen/errors"

export const farmAuthorityPubKey = new web3.PublicKey(
  "Gr99FeMTbebT5mc41s6qkosmDvZtTMXa9cbNm9urpZdY"
)

export const rewardMint = new web3.PublicKey(
  "BDNRJZ6MA3YRhHcewYMjRDEc7oWQCxHknXU98wwTsSxu"
)

export type StakeReceiptWithMetadata = StakeReceipt & {
  metadata: NFT
}

export type LockAccount = Lock & { address: web3.PublicKey }

const useStaking = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [feedbackStatus, setFeedbackStatus] = useState("")
  const [farmerAccount, setFarmerAccount] = useState<Farmer | false | null>(
    null
  )
  const [farmLocks, setFarmLocks] = useState<LockAccount[]>(null)

  const [stakeReceipts, setStakeReceipts] = useState<
    StakeReceiptWithMetadata[] | null
  >(null)

  /**
   * Fetch all stake receipts
   */
  const fetchReceipts = useCallback(async () => {
    if (publicKey) {
      try {
        const farm = findFarmAddress({
          authority: farmAuthorityPubKey,
          rewardMint,
        })

        setFeedbackStatus("Fetching receipts...")
        const receipts = await findUserStakeReceipts(
          connection,
          farm,
          publicKey
        )

        const stakingReceipts = receipts.filter(
          (receipt) => receipt.endTs === null
        )

        setFeedbackStatus("Fetching metadatas...")
        const withMetadatas = (
          await Promise.all(
            stakingReceipts.map(async (receipt) => {
              const metadata = await getNFTMetadata(
                receipt.mint.toString(),
                connection
              )

              if (!metadata) {
                return null
              }

              const withMetadata = Object.assign(receipt, { metadata })

              return withMetadata
            })
          )
        ).filter((value) => value !== null)

        setStakeReceipts(withMetadatas)
        setFeedbackStatus("")
      } catch (e) {
        setFeedbackStatus(
          "Something went wrong. " + (e.message ? e.message : e)
        )
      }
    }
  }, [publicKey])

  const fetchLocks = useCallback(async () => {
    if (publicKey) {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      try {
        setFeedbackStatus("Fecthing locks...")
        const locks = await findFarmLocks(connection, farm)

        setFarmLocks(locks)
      } catch (e) {
        setFeedbackStatus(
          "Something went wrong. " + (e.message ? e.message : e)
        )
      }
    }
  }, [publicKey])

  /**
   * Fetch farmer account
   */
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
      fetchLocks()
      fetchReceipts()
    }
  }, [publicKey])

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
      const message = fromTxError(e)

      setFeedbackStatus(
        "Something went wrong. " + (message ? message : e.message || e)
      )
    }
  }

  const stakeAll = async (NFTs: NFT[], lock: LockAccount) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      setFeedbackStatus("Initializing...")

      const stakingClient = StakingProgram(connection)

      let additionals = []
      const ixs = await Promise.all(
        NFTs.map(async (NFT) => {
          const {
            mint,
            externalMetadata: { attributes },
          } = NFT

          const tripEffectAttribute = attributes.find((attribute) => {
            return attribute.trait_type === "Trip Effect"
          })

          if (!tripEffectAttribute) {
            throw new Error("Can't stake. There is no Trip Effect attribute.")
          }

          const isTrippedOut = attributes.find((attribute) => {
            return (
              attribute.trait_type === "Trip Status" &&
              attribute.value === "Tripped out NFT"
            )
          })

          if (!isTrippedOut) {
            throw new Error("Can't stake. NFT is NOT Tripped Out.")
          }

          const { ix } = await stakingClient.createStakeInstruction({
            farm,
            mint,
            lock: lock.address,
            owner: publicKey,
            /**
             * export type TripEffect =
              | "None"
              | "Groovy"
              | "Geometric"
              | "Drip"
              | "Interdimensional"
              | "2x"
              | "3x"
              | "4x"
              | "Nirvana";
             */
            args: { amount: new BN(1), tripEffect: tripEffectAttribute.value },
          })

          return ix
        })
      )

      const tx = new Transaction()

      tx.add(...additionals, ...ixs)

      const latest = await connection.getLatestBlockhash()
      tx.recentBlockhash = latest.blockhash
      tx.feePayer = publicKey

      setFeedbackStatus("Awaiting approval...")
      const txid = await sendTransaction(tx, connection)

      setFeedbackStatus("Confirming...")
      await connection.confirmTransaction(txid)

      console.log(txid)
    } catch (e) {
      const message = fromTxError(e)

      setFeedbackStatus(
        "Something went wrong. " + (message ? message : e.message || e)
      )
    }
  }

  const unstakeAll = async (mints: web3.PublicKey[]) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)

      setFeedbackStatus("Initializing...")

      const ixs = await Promise.all(
        mints.map(async (mint) => {
          const { ix } = await stakingClient.createUnstakeInstruction({
            farm,
            mint,
            owner: publicKey,
          })

          return ix
        })
      )

      const tx = new Transaction()

      tx.add(...ixs)
      const latest = await connection.getLatestBlockhash()
      tx.recentBlockhash = latest.blockhash
      tx.feePayer = publicKey

      setFeedbackStatus("Awaiting approval...")

      const txid = await sendTransaction(tx, connection)

      setFeedbackStatus("Confirming...")

      await connection.confirmTransaction(txid)
    } catch (e) {
      const message = fromTxError(e)

      setFeedbackStatus(
        "Something went wrong. " + (message ? message : e.message || e)
      )
    }
  }

  const claim = async () => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)

      const { ix } = await stakingClient.createClaimRewardsInstruction({
        farm,
        authority: publicKey,
      })

      const latest = await connection.getLatestBlockhash("finalized")
      const tx = new Transaction()

      tx.add(ix)
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

  const buffPair = async (
    nftA: web3.PublicKey,
    nftB: web3.PublicKey,
    buffMint: web3.PublicKey
  ) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)

      const { ix } = await stakingClient.createBuffPairInstruction({
        farm,
        buffMint,
        pair: [nftA, nftB],
        authority: publicKey,
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

  const debuffPair = async (
    nftA: web3.PublicKey,
    nftB: web3.PublicKey,
    buffMint: web3.PublicKey
  ) => {
    try {
      const farm = findFarmAddress({
        authority: farmAuthorityPubKey,
        rewardMint,
      })

      const stakingClient = StakingProgram(connection)

      const { ix } = await stakingClient.createDebuffPairInstruction({
        farm,
        buffMint,
        pair: [nftA, nftB],
        authority: publicKey,
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

  return {
    farmerAccount,
    feedbackStatus,
    farmLocks,
    claim,
    initFarmer,
    stakeAll,
    unstakeAll,
    stakeReceipts,
    fetchReceipts,
    buffPair,
    debuffPair,
  }
}

export default useStaking

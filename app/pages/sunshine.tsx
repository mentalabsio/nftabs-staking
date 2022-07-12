/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Label, Text } from "@theme-ui/components"
import { FormEvent, useMemo, useState } from "react"

import Header from "@/components/Header/Header"
import { NFTGallery } from "@/components/NFTGallery/NFTGallery"
import CollectionItem from "@/components/NFTGallery/CollectionItem"
import useWalletNFTs, { NFT } from "@/hooks/useWalletNFTs"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import useStaking, { StakeReceiptWithMetadata } from "@/hooks/useStaking"
import { LoadingIcon } from "@/components/icons/LoadingIcon"
import { web3 } from "@project-serum/anchor"
import NFTSelectInput from "@/components/NFTSelectInput/NFTSelectInput"
import { PublicKey } from "@solana/web3.js"
export default function Home() {
  const { walletNFTs, fetchNFTs } = useWalletNFTs([
    "AFW3EJSbVep5uG643Qk7JLyRR2W5PVK39ECZrKBzkBP3",
  ])
  const [selectedWalletItems, setSelectedWalletItems] = useState<NFT[]>([])
  const [selectedVaultItems, setSelectedVaultItems] = useState<NFT[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    farmerAccount,
    initFarmer,
    stakeAll,
    claim,
    stakeReceipts,
    feedbackStatus,
    unstakeAll,
    fetchReceipts,
    buffPair,
    debuffPair,
    stakeFungibleTokens,
  } = useStaking()

  const { walletNFTs: bufferNFTs, fetchNFTs: fetchBufferNFTs } = useWalletNFTs([
    "9nqYaDVzYgmednWYGgkGVjNt19hjUN3ZfoA34peHK7rY",
  ])

  /**
   * Handles selected items.
   */
  const handleWalletItemClick = (item: NFT) => {
    setSelectedWalletItems((prev) => {
      const exists = prev.find(
        (NFT) => NFT.onchainMetadata.mint === item.onchainMetadata.mint
      )

      /** Remove if exists */
      if (exists) {
        return prev.filter(
          (NFT) => NFT.onchainMetadata.mint !== item.onchainMetadata.mint
        )
      }

      return prev.length < 4 ? prev?.concat(item) : prev
    })
  }

  const handleVaultItemClick = (item: NFT) => {
    setSelectedVaultItems((prev) => {
      const exists = prev.find(
        (NFT) => NFT.onchainMetadata.mint === item.onchainMetadata.mint
      )

      /** Remove if exists */
      if (exists) {
        return prev.filter(
          (NFT) => NFT.onchainMetadata.mint !== item.onchainMetadata.mint
        )
      }

      return prev.length < 4 ? prev?.concat(item) : prev
    })
  }

  const orderedReceipts = useMemo(() => {
    return (
      stakeReceipts &&
      stakeReceipts.sort((a, b) =>
        a.startTs.toNumber() < b.startTs.toNumber() ? 1 : -1
      )
    )
  }, [stakeReceipts])

  const reducedReceipts: {
    buffed: {
      [key: string]: StakeReceiptWithMetadata[]
    }
    notBuffed: StakeReceiptWithMetadata[]
  } = stakeReceipts?.reduce(
    (acc, curr) => {
      const buffer = curr.buff

      if (!buffer) {
        acc.notBuffed.push(curr)

        return acc
      }

      const currentArray = acc.buffed[buffer?.key.toString()]

      if (currentArray) {
        currentArray.push(curr)
      } else {
        acc.buffed[buffer.key.toString()] = [curr]
      }

      return acc
    },
    { buffed: {}, notBuffed: [] }
  )

  return (
    <>
      <Head>
        <title>Staking</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div
        sx={{
          "&:before": {
            content: "''",
            backgroundRepeat: "repeat",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
            opacity: 0.4,
            zIndex: 0,
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundPosition: "50% 0",
            pointerEvents: "none",
          },
        }}
      ></div>

      <main
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "stretch",
          margin: "0 auto",
          marginTop: "4rem",
          maxWidth: "78rem",
          position: "relative",
          padding: "0 1.6rem",
          minHeight: "60vh",
        }}
      >
        <Heading
          sx={{
            position: "relative",
            fontSize: "6.4rem",
            lineHeight: 0.5,
            fontFamily: "Funghetto, sans-serif",
            marginTop: "3.2rem",
          }}
          mb=".8rem"
          variant="heading1"
        >
          Stake Your
        </Heading>
        <Text
          sx={{
            position: "relative",
            fontSize: "3.2rem",
            fontFamily: "Funghetto, sans-serif",
          }}
        >
          $SUNSHINE tokens
        </Text>
        {farmerAccount === false ? (
          <>
            <Button mt="3.2rem" onClick={initFarmer}>
              Init account
            </Button>
            <Flex
              sx={{
                alignItems: "center",
                gap: ".8rem",
                margin: ".8rem 0",
              }}
            >
              {feedbackStatus ? (
                <>
                  {feedbackStatus.indexOf("Success") === -1 ? (
                    <LoadingIcon size="1.6rem" />
                  ) : null}
                  {"  "}{" "}
                  <Text
                    variant="small"
                    sx={{
                      color:
                        feedbackStatus.indexOf("Success") !== -1
                          ? "success"
                          : "text",
                    }}
                  >
                    {feedbackStatus}
                  </Text>
                </>
              ) : (
                ""
              )}
              &nbsp;
            </Flex>
          </>
        ) : null}

        {farmerAccount ? (
          <>
            <Flex
              my="3.2rem"
              sx={{
                flexDirection: "column",
                alignItems: "center",
                gap: "1.6rem",
              }}
            >
              <Flex
                sx={{
                  gap: "1.6rem",
                }}
              ></Flex>
              <Button onClick={claim}>Claim rewards</Button>

              <Flex
                sx={{
                  alignItems: "center",
                  gap: ".8rem",
                  margin: ".8rem 0",
                }}
              >
                {feedbackStatus ? (
                  <>
                    {feedbackStatus.indexOf("Success") === -1 ? (
                      <LoadingIcon size="1.6rem" />
                    ) : null}
                    {"  "}{" "}
                    <Text
                      variant="small"
                      sx={{
                        color:
                          feedbackStatus.indexOf("Success") !== -1
                            ? "success"
                            : "text",
                      }}
                    >
                      {feedbackStatus}
                    </Text>
                  </>
                ) : (
                  ""
                )}
                &nbsp;
              </Flex>
            </Flex>
          </>
        ) : null}
      </main>

      <footer
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "4rem 0",
          // marginTop: "32rem",
          position: "relative",
        }}
      >
        {/* <a
          href="https://twitter.com/magicshards"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Text
            variant="small"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              sx={{
                height: "32px",
              }}
              src="/magicshards320px.gif"
              alt="Magic Shards"
              height={32}
            />
          </Text>
        </a> */}
      </footer>
    </>
  )
}

/** @jsxImportSource theme-ui */
import Head from "next/head"

import {
  Button,
  Flex,
  Heading,
  Label,
  Select,
  Text,
} from "@theme-ui/components"
import { FormEvent, useMemo, useState } from "react"

import Header from "@/components/Header/Header"
import { NFTGallery } from "@/components/NFTGallery/NFTGallery"
import CollectionItem from "@/components/NFTGallery/CollectionItem"
import useWalletNFTs, { NFT } from "@/hooks/useWalletNFTs"
import { Tab, TabList, TabPanel, Tabs } from "react-tabs"
import useStaking, {
  LockAccount,
  StakeReceiptWithMetadata,
} from "@/hooks/useStaking"
import { LoadingIcon } from "@/components/icons/LoadingIcon"
import { web3 } from "@project-serum/anchor"
import NFTSelectInput from "@/components/NFTSelectInput/NFTSelectInput"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/router"
import { CloseIcon } from "@/components/icons"

const tabs = {
  wallet: 0,
  vault: 1,
}
export default function Home() {
  const { walletNFTs, fetchNFTs } = useWalletNFTs([
    "AFW3EJSbVep5uG643Qk7JLyRR2W5PVK39ECZrKBzkBP3",
  ])
  const [selectedWalletItems, setSelectedWalletItems] = useState<NFT[]>([])
  const [selectedVaultItems, setSelectedVaultItems] = useState<NFT[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStakeFormOpen, setIsStakeFormOpen] = useState(false)
  const {
    farmerAccount,
    farmLocks,
    initFarmer,
    stakeAll,
    claim,
    stakeReceipts,
    feedbackStatus,
    unstakeAll,
    fetchReceipts,
    buffPair,
    debuffPair,
  } = useStaking()
  const { query } = useRouter()

  console.log(farmLocks)
  const activeTab = query.tab && tabs[query.tab.toString()]

  const { walletNFTs: bufferNFTs, fetchNFTs: fetchBufferNFTs } = useWalletNFTs([
    "9nqYaDVzYgmednWYGgkGVjNt19hjUN3ZfoA34peHK7rY",
  ])
  const { publicKey } = useWallet()

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

  const orderedNFTs = useMemo(
    () =>
      walletNFTs &&
      walletNFTs.sort((a, b) =>
        a.externalMetadata.name.localeCompare(b.externalMetadata.name)
      ),
    [walletNFTs]
  )

  const filteredNFTs = useMemo(() => {
    return (
      orderedNFTs &&
      orderedNFTs.filter((NFT) => {
        const tripStatusAttribute = NFT.externalMetadata.attributes.find(
          (attribute) => attribute.trait_type === "Trip Status"
        )

        return tripStatusAttribute.value === "Tripped out NFT"
      })
    )
  }, [orderedNFTs])

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

  const sortedLocks = useMemo(
    () =>
      farmLocks &&
      farmLocks.sort((a, b) => a.duration.toNumber() - b.duration.toNumber()),
    [farmLocks]
  )

  return (
    <>
      <Head>
        <title>NFTabs Staking - Tripped Out NFTs</title>
        <meta name="description" content="Stake your Tripped Out NFTs" />
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
          Tripped Out NFTs
        </Text>
        <Text>Stake and send on trips to increase their emission!</Text>

        {!publicKey ? (
          <Text my="3.2rem">Connect your wallet first.</Text>
        ) : null}
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
              >
                {/* {farmerAccount.accruedRewards.toNumber() ? (
                  <Text>
                    Rewards:{" "}
                    <b
                      sx={{
                        fontSize: "1.6rem",
                      }}
                    >
                      {(
                        farmerAccount.accruedRewards.toNumber() / 1000000
                      ).toFixed(2)}
                    </b>
                  </Text>
                ) : null} */}

                {farmerAccount?.totalRewardRate?.toNumber() ? (
                  <Text>
                    Your earning rate:{" "}
                    <b
                      sx={{
                        fontSize: "1.6rem",
                      }}
                    >
                      {(
                        (farmerAccount?.totalRewardRate?.toNumber() / 1e9) *
                        86400
                      ).toFixed(2)}{" "}
                    </b>
                    $SUN per day
                  </Text>
                ) : null}
              </Flex>
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

            <Flex
              my="3.2rem"
              sx={{
                flexDirection: "column",
                gap: "1.6rem",
                alignSelf: "stretch",
              }}
            >
              <Tabs
                sx={{
                  margin: "3.2rem 0",
                  alignSelf: "stretch",
                  minHeight: "48rem",
                }}
                defaultIndex={activeTab}
              >
                <TabList>
                  <Tab>Your wallet</Tab>
                  <Tab>Your vault</Tab>
                </TabList>

                <TabPanel>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "1.6rem 0",
                      paddingBottom: ".8rem",
                    }}
                  >
                    <Flex
                      sx={{
                        flexDirection: "column",
                      }}
                    >
                      <Heading variant="heading2">Your wallet NFTs</Heading>
                      <Text>Select Tripped Out NFTs to stake:</Text>
                    </Flex>
                    <Button
                      onClick={async (e) => {
                        setIsStakeFormOpen(true)
                      }}
                      disabled={!selectedWalletItems.length}
                    >
                      Stake selected
                    </Button>
                    <div
                      sx={{
                        position: "fixed",
                        margin: "0 auto",
                        backgroundColor: "background",
                        visibility: isStakeFormOpen ? "visible" : "hidden",
                        opacity: isStakeFormOpen ? 1 : 0,
                        left: 0,
                        right: 0,
                        top: "16rem",
                        zIndex: 999,
                        maxWidth: "48rem",
                        padding: "3.2rem",
                        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                      }}
                    >
                      <form
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1.6rem",
                          alignItems: "center",
                        }}
                        onSubmit={async (e) => {
                          e.preventDefault()

                          const data = new FormData(e.currentTarget)

                          const selectedLockIndex = data.get("lock")

                          const selectedLock: LockAccount =
                            sortedLocks[selectedLockIndex.toString()]

                          await stakeAll(selectedWalletItems, selectedLock)
                          await fetchNFTs()
                          await fetchReceipts()
                          setSelectedWalletItems([])
                          setIsStakeFormOpen(false)
                        }}
                      >
                        <Label
                          sx={{
                            flexDirection: "column",
                            gap: ".4rem",
                          }}
                        >
                          Select a lock configuration:
                          <Select name="lock">
                            {sortedLocks &&
                              sortedLocks.map((lock, index) => (
                                <option
                                  key={lock.address.toString()}
                                  value={index}
                                >
                                  Duration:{" "}
                                  {(
                                    lock.duration.toNumber() /
                                    84_600 /
                                    7
                                  ).toFixed(0)}{" "}
                                  weeks | Bonus: +{lock.bonusFactor}% emission
                                </option>
                              ))}
                          </Select>
                        </Label>
                        <Button type="submit">Stake selected!</Button>
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
                      </form>
                    </div>
                  </Flex>

                  <NFTGallery NFTs={filteredNFTs}>
                    <>
                      {filteredNFTs?.map((item) => {
                        const isSelected = selectedWalletItems.find(
                          (NFT) =>
                            NFT.onchainMetadata.mint ===
                            item.onchainMetadata.mint
                        )

                        return (
                          <Flex
                            sx={{
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "1.6rem",
                            }}
                          >
                            <CollectionItem
                              key={item.onchainMetadata.mint}
                              item={item}
                              onClick={handleWalletItemClick}
                              sx={{
                                maxWidth: "16rem",
                                "> img": {
                                  border: "3px solid transparent",
                                  borderColor: isSelected
                                    ? "primary"
                                    : "transparent",
                                },
                              }}
                            />
                          </Flex>
                        )
                      })}
                    </>
                  </NFTGallery>
                </TabPanel>

                <TabPanel>
                  <Flex
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "1.6rem 0",
                      paddingBottom: ".8rem",
                    }}
                  >
                    <Flex
                      sx={{
                        flexDirection: "column",
                      }}
                    >
                      <Heading variant="heading2">Your vault NFTs</Heading>
                      <Text>Select NFTs to send on a trip or withdraw</Text>
                    </Flex>

                    <Flex
                      sx={{
                        gap: ".8rem",
                      }}
                    >
                      <Button
                        onClick={async (e) => {
                          setIsModalOpen(true)
                        }}
                        type="submit"
                        disabled={
                          !selectedVaultItems.length ||
                          selectedVaultItems.length !== 2
                        }
                      >
                        Send selected to a trip
                      </Button>
                      <Button
                        onClick={async (e) => {
                          const allMints = selectedVaultItems.map(
                            (item) => item.mint
                          )
                          await unstakeAll(allMints)
                          await fetchNFTs()
                          await fetchReceipts()
                          setSelectedVaultItems([])
                        }}
                        disabled={!selectedVaultItems.length}
                      >
                        Unstake selected
                      </Button>
                    </Flex>
                  </Flex>

                  {stakeReceipts ? (
                    stakeReceipts.length ? (
                      <Flex
                        sx={{
                          flexDirection: "column",
                          gap: "3.2rem",
                        }}
                      >
                        <Flex
                          sx={{
                            flexDirection: "column",
                            gap: "1.6rem",
                          }}
                        >
                          <Heading variant="h2">Staked NFTs</Heading>
                          <div
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "1.6rem",
                              alignItems: "center",

                              "@media (min-width: 768px)": {
                                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                              },
                            }}
                          >
                            {reducedReceipts ? (
                              reducedReceipts.notBuffed.length ? (
                                reducedReceipts.notBuffed.map((receipt) => {
                                  const isSelected = selectedVaultItems.find(
                                    (NFT) =>
                                      NFT.onchainMetadata.mint ===
                                      receipt.metadata.onchainMetadata.mint
                                  )

                                  return (
                                    <CollectionItem
                                      item={receipt.metadata}
                                      onClick={handleVaultItemClick}
                                      sx={{
                                        maxWidth: "16rem",
                                        "> img": {
                                          border: "3px solid transparent",
                                          borderColor: isSelected
                                            ? "primary"
                                            : "transparent",
                                        },
                                      }}
                                    />
                                  )
                                })
                              ) : (
                                <Text>There are no NFTs staked</Text>
                              )
                            ) : null}
                          </div>
                        </Flex>

                        <Flex
                          sx={{
                            flexDirection: "column",
                            gap: "1.6rem",
                          }}
                        >
                          <Heading variant="h2">Tripping NFTs</Heading>
                          {reducedReceipts ? (
                            Object.keys(reducedReceipts.buffed).length ? (
                              Object.entries(reducedReceipts.buffed).map(
                                ([key, value]) => {
                                  const nftA = value[0]
                                  const nftB = value[1]

                                  return (
                                    <Flex
                                      sx={{
                                        padding: "1.6rem",
                                        alignSelf: "flex-start",
                                        flexDirection: "column",
                                        background: (props) =>
                                          props.colors.primaryGradient,

                                        borderRadius: ".4rem",
                                        alignItems: "center",
                                        gap: "1.6rem",
                                        span: {
                                          color: "background",
                                        },

                                        "@media (min-width: 768px)": {
                                          flexDirection: "row",
                                        },
                                      }}
                                    >
                                      <Flex
                                        sx={{
                                          gap: ".8rem",
                                        }}
                                      >
                                        <CollectionItem item={nftA.metadata} />

                                        <CollectionItem item={nftB.metadata} />
                                      </Flex>
                                      <Flex
                                        sx={{
                                          flexDirection: "column",
                                          gap: ".8rem",
                                        }}
                                      >
                                        <Text>Emission doubled!</Text>
                                        <Button
                                          sx={{
                                            alignSelf: "center",
                                            justifySelf: "center",
                                          }}
                                          variant="secondary"
                                          onClick={async () => {
                                            await debuffPair(
                                              nftA.mint,
                                              nftB.mint,
                                              new web3.PublicKey(key)
                                            )
                                            await fetchNFTs()
                                            await fetchReceipts()
                                            await fetchBufferNFTs()
                                          }}
                                        >
                                          Finish the trip
                                        </Button>
                                      </Flex>
                                    </Flex>
                                  )
                                }
                              )
                            ) : (
                              <Text>There are no NFTs on a trip</Text>
                            )
                          ) : null}
                        </Flex>
                        <div
                          sx={{
                            position: "fixed",
                            margin: "0 auto",
                            backgroundColor: "background",
                            visibility: isModalOpen ? "visible" : "hidden",
                            opacity: isModalOpen ? 1 : 0,
                            left: 0,
                            right: 0,
                            top: "16rem",
                            zIndex: 999,
                            maxWidth: "48rem",
                            padding: "3.2rem",
                            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                          }}
                        >
                          <form
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "1.6rem",
                              alignItems: "center",
                            }}
                            onSubmit={async (e) => {
                              e.preventDefault()

                              const data = new FormData(e.currentTarget)

                              const buffer = new web3.PublicKey(
                                data.get("buffer_mint")
                              )

                              const allMints = selectedVaultItems.map(
                                (item) => item.mint
                              )

                              await buffPair(allMints[0], allMints[1], buffer)

                              await fetchNFTs()
                              await fetchReceipts()

                              setSelectedVaultItems([])
                              setIsModalOpen(false)
                            }}
                          >
                            <Label
                              sx={{
                                flexDirection: "column",
                                gap: ".4rem",
                              }}
                            >
                              Select a Sunshine Tab:
                              <NFTSelectInput
                                NFTs={bufferNFTs}
                                name="buffer_mint"
                                label="Select a Sunshine Tab"
                              />
                            </Label>
                            <Button type="submit">Send on a trip!</Button>
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
                          </form>
                        </div>
                      </Flex>
                    ) : (
                      <Text>There are no NFTs staked or on a trip</Text>
                    )
                  ) : (
                    <LoadingIcon
                      sx={{
                        display: "flex",
                        margin: "3.2rem auto",
                      }}
                    />
                  )}
                </TabPanel>
              </Tabs>
              <div
                onClick={() => {
                  /** Close all forms */
                  setIsModalOpen(false)
                  setIsStakeFormOpen(false)
                }}
                sx={{
                  display: isModalOpen || isStakeFormOpen ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",

                  "::before": {
                    content: "''",
                    position: "fixed",
                    backgroundColor: "background",
                    visibility:
                      isModalOpen || isStakeFormOpen ? "visible" : "hidden",
                    opacity: isModalOpen || isStakeFormOpen ? 0.5 : 0,
                    zIndex: 998,
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                  },
                }}
              >
                <Button
                  variant="resetted"
                  sx={{
                    position: "absolute",
                    top: 0,
                  }}
                  onClick={() => {
                    /** Close all forms */
                    setIsModalOpen(false)
                    setIsStakeFormOpen(false)
                  }}
                >
                  <CloseIcon />
                </Button>
              </div>
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

/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Input, Label, Text } from "@theme-ui/components"

import Header from "@/components/Header/Header"

import { LoadingIcon } from "@/components/icons/LoadingIcon"
import { useStakingFungible } from "@/hooks/useStakingFungible"
import { useWallet } from "@solana/wallet-adapter-react"
export default function Home() {
  const { stakeFungibleTokens, initFarmer, farmerAccount, feedbackStatus } =
    useStakingFungible()

  const { publicKey } = useWallet()
  return (
    <>
      <Head>
        <title>NFTabs Staking - $SUN</title>
        <meta name="description" content="Stake your $SUN tokens" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


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
          $SUN tokens
        </Text>

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
            {/* <Button onClick={claim}>Claim rewards</Button> */}

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
                &nbsp;
              </Flex>
            </>
          ) : null}

          {farmerAccount ? (
            <form
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3.2rem",
              }}
              onSubmit={async (e) => {
                e.preventDefault()

                const amount = e.currentTarget.amount.value

                await stakeFungibleTokens(amount)
              }}
            >
              <Label
                sx={{
                  flexDirection: "column",
                  gap: ".8rem",
                }}
              >
                Amount of tokens to be staked:
                <Input
                  name="amount"
                  type="number"
                  placeholder="Write the amount to stake"
                  step="any"
                />
              </Label>
              <Button type="submit">Stake $SUN</Button>
            </form>
          ) : null}
        </>
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

/** @jsxImportSource theme-ui */
import Head from "next/head"

import { Button, Flex, Heading, Label, Text } from "@theme-ui/components"

import Header from "@/components/Header/Header"

import Link from "next/link"
export default function Home() {
  return (
    <>
      <Head>
        <title>NFTabs Staking</title>
        <meta
          name="description"
          content="Stake Tripped Out NFTs and $SUN tokens"
        />
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
          NFTabs
        </Heading>
        <Text
          sx={{
            position: "relative",
            fontSize: "3.2rem",
            fontFamily: "Funghetto, sans-serif",
          }}
        >
          Staking
        </Text>
        <Flex
          sx={{
            marginTop: "3.2rem",
            gap: "4.8rem",
            flexDirection: "column",
            alignItems: "center",

            "@media (min-width: 768px)": {
              flexDirection: "row",
            },
          }}
        >
          <Link href="/nfts">
            <a>
              <Flex
                sx={{
                  flexDirection: "column",
                  minHeight: "16rem",
                  gap: "1.6rem",
                  alignItems: "center",
                }}
              >
                <img
                  sx={{
                    maxWidth: "16rem",
                    borderRadius: ".4rem",
                  }}
                  src="/tripped_out.webp"
                />
                <Heading variant="heading3">Stake Tripped Out NFTs</Heading>
              </Flex>
            </a>
          </Link>
          <a
            title="Stake Sunshine tokens"
            sx={{
              opacity: 0.5,
              cursor: "unset!important",
            }}
          >
            <Flex
              sx={{
                flexDirection: "column",
                minHeight: "16rem",
                gap: "1.6rem",
                alignItems: "center",
              }}
            >
              <div
                sx={{
                  minHeight: "16rem",
                }}
              >
                <img
                  sx={{
                    maxWidth: "16rem",
                  }}
                  src="/sunshine.png"
                />
              </div>

              <Heading variant="heading3">Stake $SUN</Heading>
            </Flex>
          </a>
        </Flex>
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

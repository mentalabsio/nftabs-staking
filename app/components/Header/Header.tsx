/** @jsxImportSource theme-ui */
import Link from "next/link"
import { Button, Container, Flex, Text } from "@theme-ui/components"

import WalletManager from "@/components/WalletManager/WalletManager"
import { useState } from "react"
import { CloseIcon, MenuIcon } from "../icons"

const Header = () => {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false)

  return (
    <Flex
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 9,
        backgroundColor: "rgba(209, 213, 218, 0.6)",
        borderBottom: "1px solid",
        backdropFilter: "blur(5px)",
        borderColor: "background2",
      }}
    >
      <Container>
        <Flex
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.6rem",
            height: "8rem",
          }}
        >
          <Link href="/" passHref>
            <Flex
              as="a"
              sx={{
                alignItems: "center",
                flexDirection: "column",
                padding: "1.6rem 0",
              }}
            >
              <Flex sx={{ alignItems: "center" }}>
                {" "}
                <img
                  sx={{
                    maxWidth: "9.6rem",
                  }}
                  src="https://uploads-ssl.webflow.com/61b843f68cc9ce09b38de69f/61b878c9fc12b52c77cea8eb_nav-logo.png"
                />
                <Text
                  sx={{
                    position: "relative",
                    fontSize: "2.4rem",
                    marginTop: ".6rem",
                    marginLeft: ".4rem",
                    fontFamily: "Funghetto, sans-serif",
                    color: "background",
                  }}
                >
                  Staking
                </Text>
              </Flex>

              {/* <Flex sx={{ alignItems: "center" }}>Staking</Flex> */}
            </Flex>
          </Link>

          <Flex
            as="nav"
            sx={{
              gap: "1.6rem",
              display: "none",
              alignItems: "center",

              /** Mobile styles when the menu is active */
              ...(isMobileMenuActive && {
                display: "flex",
                position: "fixed",
                flexDirection: "column",
                alignItems: "center",
                top: "0",
                left: "0",
                width: "100vw",
                height: "100vh",
                transition:
                  "opacity 0.125s cubic-bezier(0.175, 0.885, 0.32, 1.275),visibility 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                backgroundColor: "background",
                zIndex: 99,

                "& > a": {
                  marginBottom: ".8rem",
                },

                "&.active": {
                  visibility: "visible",
                  opacity: 1,
                },
              }),

              /** Desktop styles (reset mobile) */
              "@media (min-width: 768px)": {
                display: "flex",
                flexDirection: "row",
                width: "auto",
                height: "auto",
                padding: 0,
                position: "relative",
              },
            }}
          >
            <Flex
              sx={{
                alignSelf: "stretch",
                justifyContent: "flex-end",
                borderBottom: "1px solid",
                borderColor: "background2",
                padding: "1.6rem",
                height: "8rem",
                alignItems: "center",
                ...(!isMobileMenuActive && { display: "none" }),
              }}
            >
              <Button
                sx={{
                  padding: ".8rem",
                }}
                onClick={() => setIsMobileMenuActive(false)}
              >
                <CloseIcon />
              </Button>
            </Flex>

            <WalletManager />
          </Flex>
          <Button
            sx={{
              padding: ".8rem",
              "@media(min-width: 768px)": {
                display: "none",
              },
            }}
            onClick={() => setIsMobileMenuActive(true)}
          >
            <MenuIcon />
          </Button>
        </Flex>
      </Container>
    </Flex>
  )
}

export default Header

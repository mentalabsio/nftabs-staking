/** @jsxImportSource theme-ui */

import React, { useEffect } from "react"
import Head from "next/head"

// @ts-ignore
import NProgress from "nprogress"

import Router from "next/router"
import { Container, Flex, Text } from "@theme-ui/components"
import { useThemeUI } from "@theme-ui/core"
import Header from "../Header/Header"
import { useTotalStaked } from "@/hooks/useTotalStaked"

type Props = {
  children: React.ReactChild
}

const Layout = (props: Props) => {
  const { children } = props
  const { theme } = useThemeUI()
  const { totalStaked } = useTotalStaked()

  useEffect(() => {
    /** Set progress bar template */
    NProgress.configure({
      template: `
    <div class="bar" style="background: ${theme.colors.primary}" role="bar">
      <div class="peg" style="box-shadow: 0 0 10px ${theme.colors.primary}, 0 0 5px ${theme.colors.primary}">
      </div>
    </div>
    <div class="spinner" role="spinner">
      <div class="spinner-icon"></div>
    </div>
  `,
    })
  }, [])
  /** Attach progress bar handlers on component mount */
  useEffect(() => {
    Router.events.on("routeChangeStart", NProgress.start)
    Router.events.on("routeChangeComplete", NProgress.done)
    Router.events.on("routeChangeError", NProgress.done)
  }, [NProgress, Router])

  const percentage = (totalStaked * 100) / 1000

  return (
    <>
      <Container>
        <Header />
      </Container>
      {totalStaked ? (
        <Flex
          title={totalStaked + ` staked`}
          sx={{
            position: "relative",
            gap: "1.6rem",
            alignItems: "center",
            flexDirection: "column",
            alignSelf: "stretch",
            padding: ".4rem 0",
            // border: "1px solid",
            borderColor: "text",
          }}
        >
          <div
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${Number(percentage) > 100 ? 100 : percentage}%`,
              height: "100%",
              zIndex: -1,
              background: (props) =>
                `linear-gradient(45deg, ${props.colors.primary},  ${props.colors.text})`,
            }}
          />
          <Text
            sx={{
              textAlign: "center",
            }}
            variant="small"
          >
            {totalStaked}/1000 ({percentage}%) staked
          </Text>
          <div
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: `${Number(percentage) > 100 ? 0 : 100 - percentage}%`,
              height: "100%",
              zIndex: -1,
                opacity: 0.2,
              background: (props) => "gray",
            }}
          />
        </Flex>
      ) : null}

      <Container>{children}</Container>
    </>
  )
}

export default Layout

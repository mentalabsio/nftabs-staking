import React from "react"
import Head from "next/head"
import { ThemeProvider } from "theme-ui"
import Router, { AppProps } from "next/dist/shared/lib/router/router"
import dynamic from "next/dynamic"

import "@solana/wallet-adapter-react-ui/styles.css"

// @ts-ignore
import withGA from "next-ga"
// @ts-ignore
import "nprogress/nprogress.css"


import defaultTheme from "../styles/theme"
import Layout from "@/components/Layout/Layout"

const WalletProvider = dynamic(
  () => import("@/components/WalletProvider/WalletProvider"),
  {
    ssr: false,
  }
)

function App(props: AppProps) {
  const { Component, pageProps } = props

  return (
    <ThemeProvider theme={defaultTheme}>
      <Head>
        {/** Load font styles directly on the document to prevent flashes */}
        <link href="/fonts/fonts.css" rel="stylesheet" />
      </Head>

      <WalletProvider>
        <Layout>

        <Component {...pageProps} />
        </Layout>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default withGA(process.env.NEXT_PUBLIC_GA_ID, Router)(App)

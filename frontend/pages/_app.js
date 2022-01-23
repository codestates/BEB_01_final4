import { useEffect } from "react";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import Layout, { connectWallet } from "../components/layout";
import Web3 from "web3";
import { useStore } from "../utils/store";
import styles from "../styles/global.css";

export default function App(props) {
  const { Component, pageProps } = props;
  const setWeb3 = useStore((state) => state.setWeb3);
  const [setAccount, setUser] = useStore((state) => [state.setAccount, state.setUser]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // window.ethereum이 있다면
      try {
        const web = new Web3(window.ethereum); // 새로운 web3 객체를 만든다
        setWeb3(web);
        connectWallet({ setAccount, setUser });

        window.ethereum.on("accountsChanged", () => {
          connectWallet({ setAccount, setUser });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>NFT GGanbu</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
          fontFamily: "DungGeunMo, VT323, Noto Sans KR, sans-serif",
        }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
    </>
  );
}

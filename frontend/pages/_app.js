import { useEffect } from "react";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import Layout, { connectWallet } from "../components/layout";
import Web3 from "web3";
import { useStore } from "../utils/store";
import { useRouter } from "next/router";
import { GGanbuCollection } from "../public/compiledContracts/GGanbuCollection";
import axios from "axios";

export default function App(props) {
  const { Component, pageProps } = props;
  const [web3, setWeb3] = useStore((state) => [state.web3, state.setWeb3]);
  const [account, setAccount, setUser] = useStore((state) => [state.account, state.setAccount, state.setUser]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // window.ethereum이 있다면
      try {
        const web = new Web3(window.ethereum); // 새로운 web3 객체를 만든다
        setWeb3(web);

        window.ethereum.on("accountsChanged", () => {
          connectWallet({ setAccount, setUser });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  const handleRouteChange = async (url) => {
    const splitted = url.split("/");

    // splitted[2]는 symbol, splitted[3]는 tokenId
    if (splitted[1] === "assets" && !isNaN(splitted[3]) && splitted[4] === "sell") {
      const {
        data: { data: nftsData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections/${splitted[2]}/`, {
        withCredentials: true,
      });
      // console.log(nftsData);
      if (web3) {
        const contract = await new web3.eth.Contract(GGanbuCollection.abi, nftsData?.contractAddress, {
          from: account,
        });
        const nftOwner = await contract.methods.ownerOf(splitted[3]).call();
        console.log(nftOwner, account);
        if (nftOwner !== account) {
          alert("NFT 소유자가 아닙니다.");
          router.push("/");
        }
      }
    }
  };

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChange);
  }, [web3]);

  return (
    <>
      <Head>
        <title>NFT GGanbu</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap" rel="stylesheet" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
          fontFamily: "Noto Sans KR, sans-serif",
        }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
    </>
  );
}

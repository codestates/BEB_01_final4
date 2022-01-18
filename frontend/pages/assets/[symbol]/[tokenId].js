import { Accordion, Button, Divider, Grid, SimpleGrid, Text } from "@mantine/core";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  MdNotes,
  MdLabel,
  MdChromeReaderMode,
  MdVerticalSplit,
  MdOutlineWatchLater,
  MdAutoGraph,
  MdLocalOffer,
  MdFormatListBulleted,
} from "react-icons/md";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import Link from "next/link";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import NFTCard from "../../../components/nftCard";
import axios from "axios";
import { useStore } from "../../../utils/store";
import { GGanbuCollection } from "../../../public/compiledContracts/GGanbuCollection";
import Listings from "../../../components/listings";
import PriceHistory from "../../../components/priceHistory";

const EmptyHeartIcon = styled(AiOutlineHeart)`
  &&:hover {
    color: rgb(235, 87, 87);
  }
`;

const FillHeartIcon = styled(AiFillHeart)`
  color: rgb(235, 87, 87);
`;

const ImageWrapper = styled.div`
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
  border: 1px solid rgb(229, 232, 235);
  border-radius: 10px;
  // height: 425px;
  margin-bottom: 30px;
`;

const TradeBox = styled.div`
  padding: 15px;
  border: 1px solid rgb(229, 232, 235);
  border-radius: 10px;
  margin: 5px 0;

  & > button {
    margin: 0 3px;
  }

  & > div > button {
    margin: 0 3px;
  }
`;

const Asset = () => {
  const router = useRouter();
  const { symbol, tokenId } = router.query;
  const [clickedHeart, setClickedHeart] = useState(false);
  const [nft, setNft] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [web3, account] = useStore((state) => [state.web3, state.account]);
  const [isSelling, setIsSelling] = useState(false);
  const [nftOwner, setNftOwner] = useState("");
  const [collectionContract, setCollectionContract] = useState(null);
  const [price, setPrice] = useState(null);

  const getNft = async () => {
    try {
      if (symbol && tokenId) {
        // console.log(symbol, tokenId);
        const {
          data: { data: nftData },
        } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/assets/${symbol}/${tokenId}`, {
          withCredentials: true,
        });
        console.log(nftData);

        setNft(nftData);

        const {
          data: { data: nftsData },
        } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections/${symbol}/`, { withCredentials: true });
        // console.log(nftsData);

        setNfts(nftsData.assets);
      }
    } catch (e) {
      console.log(e.response);
    }
  };

  const getNftFromContract = async () => {
    try {
      if (web3 && nft?.contractAddress) {
        const collectionContract = await new web3.eth.Contract(GGanbuCollection.abi, nft?.contractAddress, {
          from: account,
        });
        setCollectionContract(collectionContract);

        const isSelling = await collectionContract.methods.getIsSelling(tokenId).call();
        setIsSelling(isSelling);

        const owner = await collectionContract.methods.ownerOf(tokenId).call();
        // console.log(owner);
        setNftOwner(owner);
      }
    } catch (e) {
      alert("DB, 블록체인 네트워크 상태를 확인해주세요.");
      console.dir(e);
    }

    // const result = await contract.methods.mintNFT(tokenURI).send({ from: account });
  };

  useEffect(() => {
    getNft();
    // getCollection();
  }, [symbol, tokenId, web3]);

  useEffect(() => {
    getNftFromContract();
  }, [nft, account]);

  const checkNftPriceFromContract = async () => {
    console.log("checkNftPriceFromContract");
    if (isSelling && collectionContract) {
      console.log(collectionContract);
      console.log(parseInt(tokenId), typeof parseInt(tokenId));

      const nftPrice = await collectionContract.methods.getPrice(parseInt(tokenId)).call();

      console.log(nftPrice);

      setPrice(web3.utils.fromWei(nftPrice, "ether"));
    }
  };

  useEffect(() => {
    checkNftPriceFromContract();
  }, [isSelling]);

  const handleClickBuy = async () => {
    if (!account) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    if (account === nftOwner) {
      alert("판매자는 구매할 수 없습니다.");
      return;
    }

    try {
      if (price) {
        const txResult = await collectionContract.methods
          .payment(1, tokenId)
          .send({ value: web3.utils.toWei(price, "ether") });

        let event = await collectionContract.getPastEvents("_trade", {
          fromBlock: txResult.blockNumber,
          toBlock: txResult.blockNumber,
        });

        let log = event.find((log) => log.transactionHash == txResult.transactionHash);
        console.log(log.returnValues);

        getNftFromContract();
      } else {
        alert("가격 정보를 가져오고 있습니다. 잠시만 기다려 주세요.");
      }
    } catch (e) {
      console.dir(e);
    }
  };

  return (
    <div style={{ padding: "30px 0" }}>
      <Grid>
        <Grid.Col span={5}>
          <ImageWrapper>
            <div
              style={{
                fontSize: "24px",
                display: "flex",
                justifyContent: "end",
                padding: "12px",
              }}
            >
              {clickedHeart ? (
                <FillHeartIcon onClick={() => setClickedHeart(!clickedHeart)} style={{ cursor: "pointer" }} />
              ) : (
                <EmptyHeartIcon onClick={() => setClickedHeart(!clickedHeart)} style={{ cursor: "pointer" }} />
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}>
              {nft?.imageURI && <Image className="nft-image" src={nft?.imageURI} width={500} height={385} alt="" />}
              <style jsx global>{`
                .nft-image {
                  -webkit-user-drag: none;
                  -khtml-user-drag: none;
                  -moz-user-drag: none;
                  -o-user-drag: none;
                  user-drag: none;
                }
              `}</style>
            </div>
          </ImageWrapper>
          <Accordion iconPosition="right" iconSize={30}>
            <Accordion.Item
              label={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <MdNotes />
                  <Text style={{ marginLeft: "10px" }}>Description</Text>
                </div>
              }
            >
              {nft?.description}
            </Accordion.Item>

            <Accordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdLabel />
                  <Text style={{ marginLeft: "10px" }}>Properties</Text>
                </div>
              }
            ></Accordion.Item>

            <Accordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdChromeReaderMode />
                  <Text style={{ marginLeft: "10px" }}>About</Text>
                </div>
              }
            ></Accordion.Item>
            <Accordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdVerticalSplit />
                  <Text style={{ marginLeft: "10px" }}>Details</Text>
                </div>
              }
            ></Accordion.Item>
          </Accordion>
        </Grid.Col>

        <Grid.Col span={7}>
          <Link href={`/collections/${symbol}`} passHref>
            <span style={{ color: "rgb(32, 129, 226)", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
              {symbol}
            </span>
          </Link>
          <Text style={{ fontSize: "32px", fontWeight: "bold", margin: "20px 0" }}>{nft?.name}</Text>

          {!isSelling && (
            <TradeBox>
              <Text>판매 중인 NFT가 아닙니다.</Text>
              {account && account === nftOwner && !isSelling && (
                <Button
                  style={{ marginTop: "15px" }}
                  onClick={() => {
                    router.push(`${router.asPath}/sell`);
                  }}
                  color="teal"
                  size="lg"
                >
                  Sell
                </Button>
              )}
              {account && account === nftOwner && !isSelling && (
                <Button
                  style={{ marginTop: "15px" }}
                  onClick={() => {
                    router.push(`${router.asPath}/lend`);
                  }}
                  color="teal"
                  size="lg"
                >
                  Lend
                </Button>
              )}
            </TradeBox>
          )}

          {isSelling && (
            <TradeBox>
              <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdOutlineWatchLater style={{ color: "rgb(112, 122, 131)" }} />
                  <Text style={{ color: "rgb(112, 122, 131)", marginLeft: "10px" }}>
                    {nft?.trade_selling === null ? (
                      <>판매 정보 업데이트 중입니다.</>
                    ) : (
                      <>
                        Sale starts {new Date(nft?.trade_selling?.createdAt).toDateString()}{" "}
                        {new Date(nft?.trade_selling?.createdAt).toLocaleTimeString()}
                      </>
                    )}
                  </Text>
                </div>
              </div>
              <Divider style={{ margin: "15px 0" }} />
              <div>
                <Text>Current price</Text>
                <div style={{ display: "flex", margin: "12px 0" }}>
                  <Image src="/images/eth.svg" width={16} height={16} alt="" />
                  {price && <Text style={{ fontSize: "28px", fontWeight: "bold", marginLeft: "10px" }}>{price}</Text>}
                </div>

                <Button onClick={handleClickBuy} color="teal" size="lg">
                  Buy now
                </Button>
                <Button style={{ marginTop: "15px" }} color="teal" size="lg">
                  Buy with GGanbu
                </Button>
              </div>
            </TradeBox>
          )}
          <Accordion style={{ margin: "20px 0" }} iconPosition="right">
            <Accordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
                  <MdAutoGraph />
                  <Text style={{ marginLeft: "10px" }}>Price history</Text>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "15px",
                }}
              >
                {nft?.trade_history.length > 0 ? (
                  <PriceHistory
                    labels={nft?.trade_history.map((asset) => new Date(asset.updatedAt).toLocaleDateString()).reverse()}
                    priceArr={nft?.trade_history.map((asset) => asset.price).reverse()}
                  />
                ) : (
                  <>
                    <Image src="/images/price-history.svg" width={668} height={100} alt="" />
                    <Text style={{ marginTop: "15px" }}>No item activity yet</Text>
                  </>
                )}
              </div>
            </Accordion.Item>
          </Accordion>
          <Accordion style={{ margin: "20px 0" }} iconPosition="right">
            <Accordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
                  <MdFormatListBulleted />
                  <Text style={{ marginLeft: "10px" }}>Listings</Text>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "15px",
                }}
              >
                {nft?.trade_history.length > 0 ? (
                  <Listings elements={nft?.trade_history} />
                ) : (
                  <>
                    <Image src="/images/price-history.svg" width={668} height={100} alt="" />
                    <Text style={{ marginTop: "15px" }}>No item activity yet</Text>
                  </>
                )}
              </div>
            </Accordion.Item>
          </Accordion>
          <Accordion style={{ margin: "20px 0" }} iconPosition="right">
            <Accordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
                  <MdLocalOffer />
                  <Text style={{ marginLeft: "10px" }}>Offers</Text>
                </div>
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "15px",
                }}
              >
                <Image src="/images/no-offer.svg" width={668} height={100} alt="" />
                <Text style={{ marginTop: "15px" }}>No offers yet</Text>
              </div>
            </Accordion.Item>
          </Accordion>
        </Grid.Col>
      </Grid>

      <Accordion style={{ margin: "20px 0" }} iconPosition="right">
        <Accordion.Item
          label={
            <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
              <BsFillGrid3X3GapFill />
              <Text style={{ marginLeft: "10px" }}>More From This Collection</Text>
            </div>
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "15px",
            }}
          >
            <SimpleGrid
              style={{ padding: "0 40px", gap: "50px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1160, cols: 2, spacing: "md" },
                { maxWidth: 840, cols: 1, spacing: "sm" },
              ]}
            >
              {nfts?.slice(0, 3).map((nft, i) => {
                return <NFTCard key={i} collectionSymbol={symbol} nft={nft} idx={i} />;
              })}
            </SimpleGrid>
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default Asset;

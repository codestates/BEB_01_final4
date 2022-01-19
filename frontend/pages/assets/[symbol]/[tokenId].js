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
import Web3 from "web3";
import { compressAddress } from "../../../utils";

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

const CAccordion = styled(Accordion)`
  && .mantine-Accordion-label .mantine-Text-root {
    font-size: 20px !important;
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
  const [isLending, setIsLending] = useState(false);
  const [isRenting, setIsRenting] = useState(false);
  const [nftOwner, setNftOwner] = useState("");
  const [nftRenter, setNftRenter] = useState("");
  const [collectionContract, setCollectionContract] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);
  const [lendPrice, setLendPrice] = useState(null);

  // db에서 nft 정보 조회: 해당 nft의 컬렉션 정보를 얻기 위해서
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

  // 컨트랙트에서 nft 정보 조회: 소유자, 빌린사람, 판매, 대여 상태 등을 온체인에서 확인
  const getNftFromContract = async () => {
    try {
      if (web3 && nft?.contractAddress) {
        const collectionContract = await new web3.eth.Contract(GGanbuCollection.abi, nft?.contractAddress, {
          from: account,
        });
        setCollectionContract(collectionContract);

        const isSelling = await collectionContract.methods.getIsSelling(tokenId).call();
        setIsSelling(isSelling);

        const isLending = await collectionContract.methods.getIsRental(tokenId).call();
        setIsLending(isLending);

        // 대여자 주소
        const rentAddress = await collectionContract.methods.getRentalAddress(tokenId).call();
        console.log(rentAddress);
        setNftRenter(Web3.utils.toChecksumAddress(rentAddress));
        const emptyAddress = "0x0000000000000000000000000000000000000000";
        console.log(Web3.utils.toChecksumAddress(rentAddress) !== emptyAddress);
        setIsRenting(Web3.utils.toChecksumAddress(rentAddress) !== emptyAddress);

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

  // 판매 / 대여 등록 상태인 nft의 가격 정보 조회
  const checkNftPriceFromContract = async () => {
    console.log("checkNftPriceFromContract");
    if (isSelling && collectionContract) {
      const sellPrice = await collectionContract.methods.getPrice(tokenId).call();

      console.log(sellPrice);

      setSellPrice(web3.utils.fromWei(sellPrice, "ether"));
    }

    if (isLending && collectionContract) {
      const lendPrice = await collectionContract.methods.getPrice(tokenId).call();

      console.log(lendPrice);

      setLendPrice(web3.utils.fromWei(lendPrice, "ether"));
    }
  };

  useEffect(() => {
    checkNftPriceFromContract();
  }, [isSelling, isLending]);

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
      if (sellPrice) {
        const txResult = await collectionContract.methods
          .payment(1, tokenId)
          .send({ value: web3.utils.toWei(sellPrice, "ether") });

        let event = await collectionContract.getPastEvents("_trade", {
          fromBlock: txResult.blockNumber,
          toBlock: txResult.blockNumber,
        });

        let log = event.find((log) => log.transactionHash == txResult.transactionHash);
        console.log(log.returnValues);

        setSellPrice(null);

        getNftFromContract();
      } else {
        alert("가격 정보를 가져오고 있습니다. 잠시만 기다려 주세요.");
      }
    } catch (e) {
      console.dir(e);
    }
  };

  const handleClickRent = async () => {
    if (!account) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    if (account === nftOwner) {
      alert("소유자는 대여할 수 없습니다.");
      return;
    }

    try {
      if (lendPrice) {
        const txResult = await collectionContract.methods
          .payment(2, tokenId)
          .send({ value: web3.utils.toWei(lendPrice, "ether") });

        let event = await collectionContract.getPastEvents("_rented", {
          fromBlock: txResult.blockNumber,
          toBlock: txResult.blockNumber,
        });

        let log = event.find((log) => log.transactionHash == txResult.transactionHash);
        console.log(log.returnValues);

        setLendPrice(null);

        getNftFromContract();
      } else {
        alert("가격 정보를 가져오고 있습니다. 잠시만 기다려 주세요.");
      }
    } catch (e) {
      console.dir(e);
    }
  };

  const handleClickReturn = async () => {
    if (!account) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    if (account === nftOwner) {
      alert("대여자는 반납할 수 없습니다.");
      return;
    }

    try {
      if (isRenting && nftRenter === account) {
        const txResult = await collectionContract.methods.returnNFT(tokenId).send();

        let event = await collectionContract.getPastEvents("_return", {
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
          <CAccordion iconPosition="right" iconSize={30}>
            <CAccordion.Item
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
            </CAccordion.Item>

            <CAccordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdLabel />
                  <Text style={{ marginLeft: "10px" }}>Properties</Text>
                </div>
              }
            ></CAccordion.Item>

            <CAccordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdChromeReaderMode />
                  <Text style={{ marginLeft: "10px" }}>About</Text>
                </div>
              }
            ></CAccordion.Item>
            <CAccordion.Item
              label={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdVerticalSplit />
                  <Text style={{ marginLeft: "10px" }}>Details</Text>
                </div>
              }
            ></CAccordion.Item>
          </CAccordion>
        </Grid.Col>

        <Grid.Col span={7}>
          <Link href={`/collections/${symbol}`} passHref>
            <span style={{ color: "rgb(32, 129, 226)", fontSize: "22px", fontWeight: "bold", cursor: "pointer" }}>
              {symbol}
            </span>
          </Link>
          <Text style={{ fontSize: "32px", fontWeight: "bold", margin: "20px 0" }}>{nft?.name}</Text>

          {/* 판매 X, 대여 등록 X 상태 */}
          {!isSelling && !isLending && (
            <TradeBox>
              <Text style={{ fontSize: "20px" }}>판매 중이거나 대여 등록된 NFT가 아닙니다.</Text>
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

          {/* 판매 or 대여 등록 or 대여 중인 상태 */}
          {(isSelling || isLending || isRenting) && (
            <TradeBox>
              <div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <MdOutlineWatchLater style={{ color: "rgb(112, 122, 131)" }} />

                  {/* TODO: 판매 / 대여 중인 상태에 따라 변경 필요 */}
                  {console.log(nft?.trande_selling)}
                  <Text style={{ fontSize: "18px", color: "rgb(112, 122, 131)", marginLeft: "10px" }}>
                    {nft?.trade_selling || nft?.lending ? (
                      <>
                        {nft?.trande_selling
                          ? `판매 등록: ${new Date(nft?.trade_selling?.createdAt).toLocaleString("en-GB")}`
                          : null}
                        {nft?.lending !== null
                          ? `대여 등록: ${new Date(nft?.lending?.updatedAt).toLocaleString("en-GB")}`
                          : null}
                      </>
                    ) : (
                      <>Upadting...</>
                    )}
                  </Text>
                </div>
              </div>

              <Divider style={{ margin: "15px 0" }} />

              <div>
                {/* 판매 or 대여 등록 중인 상태이면 가격을 보여준다. */}
                {(sellPrice || lendPrice) && !isRenting && (
                  <>
                    <Text style={{ fontSize: "18px" }}>Current price</Text>
                    <div style={{ display: "flex", margin: "12px 0" }}>
                      <Image src="/images/eth.svg" width={16} height={16} alt="" />
                      <Text style={{ fontSize: "28px", fontWeight: "bold", marginLeft: "10px" }}>
                        {sellPrice === null ? lendPrice : sellPrice}
                      </Text>
                    </div>
                  </>
                )}

                {/* 판매 중인 상태 */}
                {isSelling && (
                  <>
                    <Button onClick={handleClickBuy} color="teal" size="lg">
                      Buy now
                    </Button>
                    <Button style={{ marginTop: "15px" }} color="teal" size="lg">
                      Buy with GGanbu
                    </Button>
                  </>
                )}

                {/* 대여 등록 중인 상태 */}
                {isLending && !isRenting && (
                  <>
                    <Button onClick={handleClickRent} color="teal" size="lg">
                      Rent now
                    </Button>
                    <Button style={{ marginTop: "15px" }} color="teal" size="lg">
                      Rent with GGanbu
                    </Button>
                  </>
                )}

                {/* 대여 중인 상태 */}
                {isLending && isRenting && nftRenter !== account && (
                  <Text style={{ fontSize: "20px" }}>{`${compressAddress(nftRenter)}가 대여 중인 NFT입니다.`}</Text>
                )}

                {isLending && isRenting && nftRenter === account && (
                  <>
                    <Button onClick={handleClickReturn} color="teal" size="lg">
                      반납
                    </Button>
                    <Button style={{ marginTop: "15px" }} color="teal" size="lg">
                      반납 with GGanbu
                    </Button>
                  </>
                )}
              </div>
            </TradeBox>
          )}

          <CAccordion style={{ fontSize: "20px", margin: "20px 0" }} iconPosition="right">
            <CAccordion.Item
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
            </CAccordion.Item>
          </CAccordion>
          <CAccordion style={{ margin: "20px 0" }} iconPosition="right">
            <CAccordion.Item
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
            </CAccordion.Item>
          </CAccordion>
          <CAccordion style={{ margin: "20px 0" }} iconPosition="right">
            <CAccordion.Item
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
            </CAccordion.Item>
          </CAccordion>
        </Grid.Col>
      </Grid>

      <CAccordion style={{ margin: "20px 0" }} iconPosition="right">
        <CAccordion.Item
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
        </CAccordion.Item>
      </CAccordion>
    </div>
  );
};

export default Asset;

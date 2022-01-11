import { Accordion, Button, Grid, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { useRouter } from "next/router";
import { aether } from "../../../public/collections/aether";
import { axie } from "../../../public/collections/axie";
import { clonex } from "../../../public/collections/clonex";
import { cryptoavatars } from "../../../public/collections/cryptoavatars";
import { decentralandNames } from "../../../public/collections/decentraland-names";
import { decentralandWearables } from "../../../public/collections/decentraland-wearables";
import { decentraland } from "../../../public/collections/decentraland";
import { illuvium } from "../../../public/collections/illuvium";
import { nftWorlds } from "../../../public/collections/nft-worlds";
import { sandbox } from "../../../public/collections/sandbox";
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
import { useState } from "react";
import { BsFillGrid3X3GapFill } from "react-icons/bs";
import NFTCard from "../../../components/nftCard";

const EmptyHeartIcon = styled(AiOutlineHeart)`
  &&:hover {
    color: rgb(235, 87, 87);
  }
`;

const FillHeartIcon = styled(AiFillHeart)`
  color: rgb(235, 87, 87);
`;

const staticCollections = {
  Aether: aether,
  Axie: axie,
  Clonex: clonex,
  Cryptoavatars: cryptoavatars,
  "Decentraland Names": decentralandNames,
  "Decentraland Wearables": decentralandWearables,
  Decentraland: decentraland,
  Illuvium: illuvium,
  "NFT Worlds": nftWorlds,
  "The Sandbox": sandbox,
};

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

const BuyBox = styled.div`
  padding: 5px 10px;
  border: 1px solid rgb(229, 232, 235);
  border-radius: 10px;
  margin: 5px 0;
`;

const Asset = () => {
  const router = useRouter();
  const { tokenCA, tokenId } = router.query;
  const [clickedHeart, setClickedHeart] = useState(false);

  // 더미 데이터를 눌러서 들어왔으면
  // tokenCA가 collectionName임 예) Axie
  // tokenId는 더미데이터의 assets의 인덱스임
  if (Object.keys(staticCollections).includes(tokenCA)) {
    const nft = staticCollections[tokenCA].assets[tokenId];
    const nfts = staticCollections[tokenCA].assets;

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
                <Image className="nft-image" src={nft.tokenURI} width={500} height={385} alt="" />
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
                Colors, fonts, shadows and many other parts are customizable to fit your design needs
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
            <Link href={`/collections/${tokenCA}`} passHref>
              <span style={{ color: "rgb(32, 129, 226)", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
                {tokenCA}
              </span>
            </Link>
            <Text style={{ fontSize: "32px", fontWeight: "bold", margin: "20px 0" }}>{nft.name}</Text>
            <BuyBox>
              <div
                style={{
                  borderBottomStyle: "solid",
                  borderBottomColor: "rgb(229, 232, 235)",
                  borderBottomWidth: "1px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", padding: "12px" }}>
                  <MdOutlineWatchLater style={{ color: "rgb(112, 122, 131)" }} />
                  <Text style={{ color: "rgb(112, 122, 131)", marginLeft: "10px" }}>
                    Sale ends July 9, 2022 at 12:53pm KST
                  </Text>
                </div>
              </div>
              <div style={{ padding: "12px" }}>
                <Text>Current price</Text>
                <div style={{ display: "flex", margin: "12px 0" }}>
                  <Image src="/images/eth.svg" width={16} height={16} alt="" />
                  <Text style={{ fontSize: "28px", fontWeight: "bold", marginLeft: "10px" }}>0.259</Text>
                </div>

                <Button color="teal" size="lg">
                  Buy now
                </Button>
              </div>
            </BuyBox>

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
                  <Image src="/images/price-history.svg" width={668} height={100} alt="" />
                  <Text style={{ marginTop: "15px" }}>No item activity yet</Text>
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
                  <Image src="/images/price-history.svg" width={668} height={100} alt="" />
                  <Text style={{ marginTop: "15px" }}>No item activity yet</Text>
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
              {/* <Grid justify="space-between" style={{ width: "100%" }}>
                {nfts.slice(0, 3).map((nft, i) => {
                  return <NFTCard key={i} collectionName={tokenCA} nft={nft} idx={i} />;
                })}
              </Grid> */}

              <SimpleGrid
                style={{ padding: "0 40px", gap: "50px" }}
                cols={3}
                spacing="lg"
                breakpoints={[
                  { maxWidth: 1160, cols: 2, spacing: "md" },
                  { maxWidth: 840, cols: 1, spacing: "sm" },
                ]}
              >
                {nfts.slice(0, 3).map((nft, i) => {
                  return <NFTCard key={i} collectionName={tokenCA} nft={nft} idx={i} />;
                })}
              </SimpleGrid>
            </div>
          </Accordion.Item>
        </Accordion>
      </div>
    );
  } else return null; // TODO: DB에서 가져온 데이터 뿌리기
};

export default Asset;

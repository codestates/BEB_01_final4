import { Grid, SimpleGrid, Text } from "@mantine/core";
import styled from "styled-components";
import Image from "next/image";
import { useRouter } from "next/router";

import { aether } from "../../public/collections/aether";
import { axie } from "../../public/collections/axie";
import { clonex } from "../../public/collections/clonex";
import { cryptoavatars } from "../../public/collections/cryptoavatars";
import { decentralandNames } from "../../public/collections/decentraland-names";
import { decentralandWearables } from "../../public/collections/decentraland-wearables";
import { decentraland } from "../../public/collections/decentraland";
import { illuvium } from "../../public/collections/illuvium";
import { nftWorlds } from "../../public/collections/nft-worlds";
import { sandbox } from "../../public/collections/sandbox";
import NFTCard from "../../components/nftCard";

const StatBox = styled.div`
  flex: 1;
  border: 1px solid rgb(229, 232, 235);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ransition: all 0.2s ease 0s;
  &:hover {
    cursor: pointer;
    box-shadow: rgb(4 17 29 / 25%) 0px 0px 8px 0px;
  }
`;

const StatCount = styled.div`
  font-size: 30px;
  font-weight: bold;
`;

const StatTitle = styled.div`
  font-size: 14px;
  color: grey;
`;

const Description = styled.div`
  max-width: 720px;
  margin: 0 auto;
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

const NFTS = () => {
  const router = useRouter();
  const { collection: collectionName } = router.query;

  if (Object.keys(staticCollections).includes(collectionName)) {
    return (
      <div>
        <div
          style={{
            width: "100%",
            height: "220px",
            backgroundImage: `url(${staticCollections[collectionName].banner_image_url})`,
          }}
        ></div>
        <div
          style={{
            marginTop: "-63px",
            marginLeft: "auto",
            marginRight: "auto",
            width: "126px",
            height: "126px",
            backgroundImage: `url(${staticCollections[collectionName].large_image_url})`,
            backgroundSize: "cover",
            borderRadius: "50%",
            border: "1px solid white",
          }}
        ></div>

        <Description>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: "38px", fontWeight: "bold", marginRight: "10px" }} align="center">
              {staticCollections[collectionName].name}
            </Text>
            <div style={{ width: "36px", height: "36px" }}>
              <Image src="/images/verified.png" width="36px" height="36px" alt="" />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", margin: "15px auto", width: "580px", height: "90px" }}>
              <StatBox style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", borderRightWidth: "0px" }}>
                <StatCount>30</StatCount>
                <StatTitle>items</StatTitle>
              </StatBox>
              <StatBox style={{ borderRightWidth: "0px" }}>
                <StatCount>103</StatCount>
                <StatTitle>owners</StatTitle>
              </StatBox>
              <StatBox style={{ borderRightWidth: "0px" }}>
                <StatCount>
                  <Image width={23} height={23} src="/images/eth.svg" alt="" />
                  <span style={{ marginLeft: "3px" }}>200</span>
                </StatCount>
                <StatTitle>floor price</StatTitle>
              </StatBox>
              <StatBox style={{ borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }}>
                <StatCount>
                  <Image width={23} height={23} src="/images/eth.svg" alt="" />
                  <span style={{ marginLeft: "3px" }}>13</span>
                </StatCount>
                <StatTitle>volume traded</StatTitle>
              </StatBox>
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "20px 0" }}>{staticCollections[collectionName].description}</div>
        </Description>

        {/* <Grid justify="space-between">
          {staticCollections[collectionName].assets.map((nft, i) => {
            return nft.tokenURI === null ? null : <NFTCard key={i} collectionName={collectionName} nft={nft} idx={i} />;
          })}
        </Grid> */}

        <SimpleGrid
          style={{ padding: "0 80px" }}
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: 1160, cols: 2, spacing: "md" },
            { maxWidth: 840, cols: 1, spacing: "sm" },
          ]}
        >
          {staticCollections[collectionName].assets.map((nft, i) => {
            return nft.tokenURI === null ? null : <NFTCard key={i} collectionName={collectionName} nft={nft} idx={i} />;
          })}
        </SimpleGrid>
      </div>
    );
  } else return null; // TODO: DB에서 호출한 데이터 뿌리는 곳
};

export default NFTS;

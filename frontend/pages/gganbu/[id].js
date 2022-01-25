import { Grid, Text } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ImageWrapper } from "../assets/[symbol]/[tokenId]";

const GGanbuDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const nft = {
    id: 1,
    is_minted: true,
    token_ids: 1,
    ownerAddress: "0x1312Dc485721d7dF973Ff6E867B676faeFf77CEb",
    creatorAddress: "0x1312Dc485721d7dF973Ff6E867B676faeFf77CEb",
    tokenURI: "http://localhost:4000/metadata/nft/1",
    contractAddress: "0x3fCB138E750935824f1690aD5Eb038116955336d",
    name: "k1k1",
    description: "kk",
    traits: "[]",
    imageURI: "https://ipfs.infura.io/ipfs/QmSif9VtgMo78Uxrc1ya6xDoLQyrd9xJiqLAvzmxrxGV3i",
    renterAddress: null,
    createdAt: "2022-01-24T16:18:58.000Z",
    updatedAt: "2022-01-24T16:19:11.000Z",
    collection: {
      id: 1,
      is_created: true,
      contractAddress: "0x3fCB138E750935824f1690aD5Eb038116955336d",
      ownerAddress: "0x1312Dc485721d7dF973Ff6E867B676faeFf77CEb",
      name: "new col",
      symbol: "nc",
      description: "desc",
      image_url: "https://ipfs.infura.io/ipfs/QmbsQ9PR61NwbqcurFkjfwkW26eV8Hi2nAGU6pPFJS7f2Y",
      banner_url: "https://ipfs.infura.io/ipfs/QmbsQ9PR61NwbqcurFkjfwkW26eV8Hi2nAGU6pPFJS7f2Y",
      createdAt: "2022-01-24T16:18:46.000Z",
      updatedAt: "2022-01-24T16:18:48.000Z",
    },
    isSelling: true,
    price: 3.3,
    trade_ca: null,
    seller: "0x1312Dc485721d7dF973Ff6E867B676faeFf77CEb",
    trade_selling: {
      id: 1,
      token_ids: 1,
      collectionAddress: "0x3fCB138E750935824f1690aD5Eb038116955336d",
      status: "selling",
      trade_ca: null,
      price: 3.3,
      seller: "0x1312Dc485721d7dF973Ff6E867B676faeFf77CEb",
      buyer: null,
      sellHash: "0xa050ac76a330fd1a5624bbe909b9eb5bded8287a276022e3d9a24fe021ddaae8",
      buyHash: null,
      createdAt: "2022-01-24T16:19:26.000Z",
      updatedAt: "2022-01-24T16:19:26.000Z",
    },
    isLending: false,
    lending: null,
    isRenting: false,
    renting: null,
    trade_history: [],
    rent_history: [],
    isRecruiting: true,
    recruiting: {
      id: 1,
      type: "gganbu",
      gganbuAddress: "0xf74dEC66Abf0099cD8BD2251cF18b55caA6DDcfd",
      nft_collectionAddress: "0x3fCB138E750935824f1690aD5Eb038116955336d",
      nft_token_ids: 1,
      balance: 0.1,
      isActive: true,
      description:
        "layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'layout='fill'",
      rewards: 0,
      status: "recruit",
      createdAt: "2022-01-24T16:19:41.000Z",
      updatedAt: "2022-01-24T16:19:41.000Z",
      members: [
        {
          id: 1,
          memberAddress: "0xA5c713F475BE55D4dC333d4683D3A2eA7504B725",
          gganbuAddress: "0xf74dEC66Abf0099cD8BD2251cF18b55caA6DDcfd",
          staking_value: 0.1,
          staking_ratio: 3.03,
          my_rewards: 0,
          status: "active",
          createdAt: "2022-01-24T16:19:41.000Z",
          updatedAt: "2022-01-24T16:19:41.000Z",
        },
      ],
    },
    ownedByGGanbu: false,
    gganbu: null,
    gganbu_history: [],
    hasSuggestion: false,
    suggestions: null,
    suggestion_history: [],
  };

  const getGGanbu = async () => {};

  useEffect(() => {
    getGGanbu();
  }, [id]);

  // 목표 NFT, 판매금액, 모금액, 참여자, 투표 현황
  return (
    <div>
      <Text align="center" style={{ fontSize: "32px", margin: "30px 0 80px 0" }}>
        깐부
      </Text>
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
            ></div>
            <div style={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}>
              {nft?.imageURI && <Image className="nft-image" src={nft?.imageURI} width={4201} height={385} alt="" />}
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
        </Grid.Col>
        <Grid.Col span={7}></Grid.Col>
      </Grid>
    </div>
  );
};

export default GGanbuDetail;

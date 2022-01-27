import { Badge, Grid } from "@mantine/core";
import Image from "next/image";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getFontDefinitionFromManifest } from "next/dist/server/font-utils";

const NftWrapper = styled.div`
  &:hover {
    transform: translateY(-2px);
    box-shadow: rgb(4 17 29 / 25%) 0px 0px 8px 0px;
    transition: all 0.1s ease 0s;
  }
  cursor: pointer;
`;

const CImage = styled(Image)`
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const BadgeWrapper = styled.div`
  padding: 5px;
  height: 37px;
  display: flex;
  justify-content: right;

  && > * {
    margin: 0 3px;
  }

  && * {
    font-size: 17px;
  }
`;

const RankingCard = ({ rankInfo, index, category }) => {
  const router = useRouter();

  const [imageURI, setImageURI] = useState(null);
  const [name, setName] = useState(null);
  console.log(name, imageURI);

  const getInfo = () => {
    if (category === "nft") {
      setImageURI(rankInfo.asset.imageURI);
      setName(rankInfo.asset.name);
    } else if (category === "user") {
      console.log(rankInfo.name);
      setImageURI(rankInfo.imageURI);
      if (rankInfo.name === null) {
        setName(`익명의 부자 ${rankInfo.id}`);
      } else {
        setName(rankInfo.name);
      }
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  return (
    <Grid.Col
      span={12}
      md={6}
      lg={4}
      onClick={() => {
        if (category === "user") {
        } else if (rankInfo.token_ids) {
          router.push(`/assets/${rankInfo.collection.symbol}/${rankInfo.token_ids}`);
        } else {
          alert(
            "데몬이 아직 업데이트 하지 않은 NFT를 선택하셨습니다. 데몬이 tokenId 정보를 DB에 가져올 때까지 잠시만 기다려주세요.",
          );
        }
      }}
    >
      <NftWrapper
        style={{
          width: 320,
          margin: "20px auto",
          border: "1px solid rgb(229, 232, 235)",
          borderRadius: "10px",
        }}
      >
        <div>
          {imageURI && (
            <CImage
              unoptimized={true}
              src={imageURI}
              width="320px"
              height="320px"
              layout="responsive"
              objectFit="cover"
              alt=""
            />
          )}
        </div>
        <BadgeWrapper>
          <Badge size="lg" color="pink" radius={4} variant="outline">
            TOP {index + 1}
          </Badge>
        </BadgeWrapper>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "60px",
            overflow: "hidden",
            padding: "5px 10px",
            fontSize: "18px",
          }}
        >
          <div style={{ width: "70%" }}>{name}</div>
          <div style={{ display: "flex", width: "30%", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", marginTop: "3px" }}>
              {category === "nft" ? <Image width={30} height={30} src="/images/eth.svg" alt="" /> : null}
              <span style={{ marginLeft: "3px", fontWeight: "bold", fontSize: "25px" }}>
                {category === "nft" ? rankInfo?.price : null}
              </span>
            </div>
          </div>
        </div>
      </NftWrapper>
    </Grid.Col>
  );
};

export default RankingCard;

import { Badge, Grid } from "@mantine/core";
import Image from "next/image";
import styled from "styled-components";
import { useRouter } from "next/router";

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

const NFTCard = ({ collectionSymbol, nft }) => {
  const router = useRouter();
  return (
    <Grid.Col
      span={12}
      md={6}
      lg={4}
      onClick={() => {
        if (nft.token_ids) {
          router.push(`/assets/${collectionSymbol}/${nft.token_ids}`);
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
          {(nft?.imageURI || nft?.asset?.imageURI) && (
            <CImage
              unoptimized={true}
              src={nft?.imageURI || nft?.asset?.imageURI}
              width="320px"
              height="320px"
              layout="responsive"
              objectFit="cover"
              alt=""
            />
          )}
        </div>
        <BadgeWrapper>
          {nft?.isSelling && (
            <Badge size="lg" color="pink" radius={4} variant="outline">
              판매 중
            </Badge>
          )}
          {nft?.isLending && (
            <Badge size="lg" color="indigo" radius={4} variant="outline">
              대여 가능
            </Badge>
          )}
          {!nft?.is_minted && !nft?.asset?.is_minted && (
            <Badge size="lg" color="blue" radius={4} variant="outline">
              민팅 중
            </Badge>
          )}
          {nft?.isRenting && (
            <Badge size="lg" color="orange" radius={4} variant="outline">
              대여 중
            </Badge>
          )}
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
          <div style={{ width: "70%" }}>{nft?.name || nft?.asset?.name}</div>
          {nft?.isSelling && (
            <div style={{ display: "flex", width: "30%", flexDirection: "column", alignItems: "flex-end" }}>
              <span>Price</span>
              <div style={{ display: "flex", alignItems: "center", marginTop: "3px" }}>
                <Image width={14} height={14} src="/images/eth.svg" alt="" />
                <span style={{ marginLeft: "3px", fontWeight: "bold", fontSize: "17px" }}>
                  {nft?.trade_selling?.price}
                </span>
              </div>
            </div>
          )}

          {/* <div style={{ height: "30px" }}>2</div> */}
        </div>
      </NftWrapper>
    </Grid.Col>
  );
};

export default NFTCard;

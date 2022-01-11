import { Grid } from "@mantine/core";
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

const NFTCard = ({ collectionSymbol, nft, idx }) => {
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
            "더미 데이터 또는 데몬이 아직 업데이트 하지 않은 NFT를 선택하셨습니다. tokenId가 없어서 상세 정보 확인이 불가능합니다.",
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
          {nft?.imageURI && (
            <CImage
              unoptimized={true}
              src={nft?.imageURI}
              width="320px"
              height="320px"
              layout="responsive"
              objectFit="cover"
              alt=""
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "60px",
            overflow: "hidden",
            padding: "5px 10px",
            fontSize: "13px",
          }}
        >
          <div style={{ width: "70%" }}>{nft?.name}</div>

          <div style={{ display: "flex", width: "30%", flexDirection: "column", alignItems: "flex-end" }}>
            <span>Price</span>
            <div style={{ display: "flex", alignItems: "center", marginTop: "3px" }}>
              <Image width={14} height={14} src="/images/eth.svg" alt="" />
              <span style={{ marginLeft: "3px", fontWeight: "bold", fontSize: "14px" }}>22</span>
            </div>
          </div>

          {/* <div style={{ height: "30px" }}>2</div> */}
        </div>
      </NftWrapper>
    </Grid.Col>
  );
};

export default NFTCard;

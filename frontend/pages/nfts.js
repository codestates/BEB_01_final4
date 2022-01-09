import { Grid, Text } from "@mantine/core";
import { sandbox } from "../public/collections/sandbox";
import styled from "styled-components";
import Image from "next/image";

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

const NFTS = () => {
  return (
    <div>
      <Text style={{ fontSize: "32px", margin: "40px 0", fontWeight: "bold" }} align="center">
        The Sandbox
      </Text>

      <Grid style={{ padding: "0 60px" }}>
        {sandbox.map((nft, i) => {
          return nft.tokenURI === null ? null : (
            <Grid.Col span={12} md={6} lg={4} key={i}>
              <NftWrapper
                style={{
                  width: 320,
                  margin: "20px auto",
                  border: "1px solid rgb(229, 232, 235)",
                  borderRadius: "10px",
                }}
              >
                <div>
                  {nft?.tokenURI && (
                    <CImage
                      unoptimized={true}
                      src={nft.tokenURI}
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
                  <div style={{ width: "70%" }}>{nft.name}</div>

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
        })}
      </Grid>
    </div>
  );
};

export default NFTS;

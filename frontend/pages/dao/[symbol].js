import { useEffect, useState } from "react";
import { Grid, Button, Modal, Table, Text, TextInput, Divider, SimpleGrid } from "@mantine/core";
import { CImage, CollectionWrapper, EllipsisDiv } from "./styles";
import styled from "styled-components";
import Image from "next/image";
import { useRouter } from "next/router";
import NFTCard from "../../components/nftCard";
import { useStore } from "../../utils/store";
import Link from "next/link";
import axios from "axios";

const CTable = styled(Table)`
  && td {
    font-size: 16px;
  }

  && th {
    font-size: 16px;
  }
`;

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
  font-size: 19px;
  color: grey;
`;

const Description = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const NameBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const getFloorPrice = (assets) => {
  let floor = null;

  if (assets.length === 0) return "-";

  for (let asset of assets) {
    if (floor === null && asset.trade_selling) {
      floor = asset.trade_selling.price;
    }
    if (floor > asset.trade_selling?.price) {
      floor = asset.trade_selling?.price;
    }
  }

  return floor === null ? "-" : floor;
};

const NFTS = () => {
  const router = useRouter();
  const { symbol } = router.query;
  const [dao, setCollection] = useState(null);
  const account = useStore((state) => state.account);


  const getCollection = async () => {
    if (symbol) {
      const {
        data: { data: dao },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/dao/${symbol}`);
      //alert(JSON.stringify(dao));
      //dao 테스트 DATA 세팅 필요
      setCollection(dao);
    }
  };
  useEffect(() => {
    getCollection();
  }, [symbol]);

  if(dao) {
    if(dao.name == 'korean whales') {
      //nft wolrlds
      dao.banner_url = 'https://lh3.googleusercontent.com/Z83eH0SKXuR-szAsaFQvoz_mQUshxiEJjrl6nh71-3gOD4U-Z5Crpt2qcwGTf4vltfBWods9VVGDkv436z2_QmKK-Wi7aBrd640l=s2500';
      dao.image_url = 'https://lh3.googleusercontent.com/Z83eH0SKXuR-szAsaFQvoz_mQUshxiEJjrl6nh71-3gOD4U-Z5Crpt2qcwGTf4vltfBWods9VVGDkv436z2_QmKK-Wi7aBrd640l=s300';
    } else {
      //일루비움
      dao.banner_url = 'https://lh3.googleusercontent.com/7eZ61l0C61l8wbifkX0jBg3oglKcHTUcRDiZS6xF-cxCaNvz3jBAwp_XoDZAgwLS4o1VGoGRXbtHGHfSJWEhLqmJuTl5E3nF_F6eIg=s2500';
      dao.image_url = 'https://lh3.googleusercontent.com/IRKmFBtoKfjejTrfm5zj20ztCpR1oIO5GNrhak78C2fLLdkBHi1SOOe83ciouTVuMfONykdelm0ugtVy67FnKVEBbN2nF5n2Ys2_kw=s300';
    }
  }

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "220px",
          backgroundImage: `url(${dao?.banner_url})`,
          backgroundPosition: "center",
        }}
      ></div>
      <div
        style={{
          marginTop: "-63px",
          marginLeft: "auto",
          marginRight: "auto",
          width: "126px",
          height: "126px",
          backgroundImage: `url(${dao?.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "50%",
          border: "1px solid white",
        }}
      ></div>

      <Description>
        <NameBox>
          <Text style={{ fontSize: "38px", fontWeight: "bold", marginRight: "10px" }} align="center">
            {dao?.name}
          </Text>
        </NameBox>
        <div style={{ textAlign: "center", margin: "20px 0", fontSize: "22px" }}>{dao?.description}</div>
      </Description>
      <div style={{ textAlign: "right", margin: "20px 0", fontSize: "22px" }}>
        <Button size="lg">Staking 추가하기</Button>&nbsp;&nbsp;
        <Button color="yellow" size="lg">Staking 출금하기</Button>&nbsp;&nbsp;
        <Button color="red" size="lg">탈퇴하기</Button>
      </div>

      <Divider style={{ margin: "30px 0 40px 0" }} />

      <SimpleGrid
        style={{ padding: "0 0px" }}
        cols={2}
        spacing="lg"
        breakpoints={[
          { maxWidth: 1250, cols: 1, spacing: "md" },
          { maxWidth: 850, cols: 1, spacing: "sm" },
        ]}
      >
        <Grid.Col
          span={8}
          md={8}
          lg={8}    
        >
          <CollectionWrapper
            style={{
              width: 800,
              margin: "20px auto",
              border: "1px solid rgb(229, 232, 235)",
              borderRadius: "10px",
            }}
          >

            <div style={{ 
              height: "300px", overflow: "hidden", padding: "0 10px",
            }}>
              <CTable highlightOnHover>
                <tbody>
                  <tr style={{ 
                    cursor: "pointer",
                  }}
                  >
                    <td style={{ fontSize: "20px", width: "20%" }}>가입자#</td>
                    <td style={{ fontSize: "30px", width: "30%" }}>{dao?.num_of_members} 명</td>
                    <td style={{ fontSize: "20px", width: "20%" }}>자금 Pool</td>
                    <td style={{ fontSize: "30px", width: "30%" }}>
                      <div style={{ display: "flex" }}>
                        <Image src="/images/eth.svg" width={12} height={12} alt="" />
                        <span style={{ marginLeft: "5px" }}>
                          {/* {Math.round(parseFloat(dao.members.reduce((acc, cur) => acc + cur.staking_value, 0)) * 100) / 100} */}
                          {dao?.balance}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td>보유 NFTs</td>
                    <td>{dao?._num_of_own_nft} 개</td>
                    <td>Pool 사용률</td>
                    <td>{dao?._pool_usage} %</td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td>대여 NFTs</td>
                    <td>{dao?._num_of_lend_nft} 개</td>
                    <td>총 수익</td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <Image src="/images/eth.svg" width={12} height={12} alt="" />
                        <span style={{ marginLeft: "5px" }}>
                          {dao?.rewards}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </CTable>

            </div>
          </CollectionWrapper>


        </Grid.Col>

        <Grid.Col
          span={4}
          md={4}
          lg={4}    
        >
          <CollectionWrapper
            style={{
              width: 400,
              margin: "20px auto",
              border: "1px solid rgb(229, 232, 235)",
              borderRadius: "10px",
            }}
          >
            <div>
              <StatBox style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", borderRightWidth: "0px" }}>
                <StatCount>{dao?.number_of_assets}</StatCount>
                <StatTitle>items</StatTitle>
              </StatBox>
              <div style={{ display: "flex", margin: "15px auto", width: "580px", height: "90px" }}>
                <StatBox style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", borderRightWidth: "0px" }}>
                  <StatCount>{dao?.number_of_assets}</StatCount>
                  <StatTitle>items</StatTitle>
                </StatBox>
                <StatBox style={{ borderRightWidth: "0px" }}>
                  <StatCount>{dao?.number_of_owners}</StatCount>
                  <StatTitle>owners</StatTitle>
                </StatBox>
                <StatBox style={{ borderRightWidth: "0px" }}>
                  <StatCount>
                    <Image width={23} height={23} src="/images/eth.svg" alt="" />
                    <span style={{ marginLeft: "3px" }}>
                      {Boolean(dao?.assets) === true ? getFloorPrice(dao?.assets) : "-"}
                    </span>
                  </StatCount>
                  <StatTitle>floor price</StatTitle>
                </StatBox>
                <StatBox style={{ borderTopRightRadius: "8px", borderBottomRightRadius: "8px" }}>
                  <StatCount>
                    <Image width={23} height={23} src="/images/eth.svg" alt="" />
                    <span style={{ marginLeft: "3px" }}>
                      {dao?.volume_traded === null ? "-" : dao?.volume_traded}
                    </span>
                  </StatCount>
                  <StatTitle>volume traded</StatTitle>
                </StatBox>
              </div>
            </div>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                margin: "0 auto",
                marginTop: "-30px",
                position: "relative",
                border: "1px solid grey",
                backgroundColor: "blue",
              }}
            >
              {/* <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  margin: "0 auto",
                  marginTop: "3px",
                  position: "relative",
                  backgroundImage: `url(${dao.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div> */}
            </div>
            <div style={{ height: "300px", overflow: "hidden", padding: "0 10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "20%",
                  overflow: "hidden",
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                {dao?.name}
              </div>
              <div>
                <p
                  style={{
                    wordWrap: "break-word",
                    width: "100%",
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    whiteSpace: "initial",
                    fontSize: "18px",
                  }}
                >
                  {dao?.description}
                </p>
              </div>
              <CTable highlightOnHover>
                <tbody>
                  <tr style={{ cursor: "pointer" }}>
                    <td style={{ width: "20%" }}>가입자#</td>
                    <td style={{ width: "30%" }}>{dao?.num_of_members} 명</td>
                    <td style={{ width: "20%" }}>자금 Pool</td>
                    <td style={{ width: "30%" }}>
                      <div style={{ display: "flex" }}>
                        <Image src="/images/eth.svg" width={12} height={12} alt="" />
                        <span style={{ marginLeft: "5px" }}>
                          {/* {Math.round(parseFloat(dao.members.reduce((acc, cur) => acc + cur.staking_value, 0)) * 100) / 100} */}
                          {dao?.balance}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td>보유 NFTs</td>
                    <td>{dao?._num_of_own_nft} 개</td>
                    <td>Pool 사용률</td>
                    <td>{dao?._pool_usage} %</td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td>대여 NFTs</td>
                    <td>{dao?._num_of_lend_nft} 개</td>
                    <td>총 수익</td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <Image src="/images/eth.svg" width={12} height={12} alt="" />
                        <span style={{ marginLeft: "5px" }}>
                          {dao?.rewards}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </CTable>

            </div>
          </CollectionWrapper>


        </Grid.Col>

      </SimpleGrid>
    </div>
  );
};

export default NFTS;

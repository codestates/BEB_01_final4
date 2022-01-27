import { useEffect, useState } from "react";
import { Grid, Button, Modal, Table, Text, TextInput, Tabs, Divider, SimpleGrid } from "@mantine/core";
import { CImage, CollectionWrapper, EllipsisDiv } from "./styles";
import styled from "styled-components";
import Image from "next/image";
import { useRouter } from "next/router";
import NFTCard from "../../components/nftCard";
import { useStore } from "../../utils/store";
import Link from "next/link";
import axios from "axios";
import {
  MdOutlineCollections,
  MdOutlineCollectionsBookmark,
  MdOutlineFormatPaint,
  MdOutlineSell,
  MdOutlineHistory,
  MdOutlineHowToVote,
} from "react-icons/md";

const Container = styled.div`
  max-width: 100%;
  padding: 20px 0 150px 0;
`;

const CTabs = styled(Tabs)`
  && .mantine-Tabs-tabLabel {
    font-size: 15px;
    font-weight: bold;
  }

  && button {
    margin: 0 20px;
  }

  && .mantine-Tabs-tabLabel {
    font-size: 20px;
  }
`;

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

  const setDummyData = (dao) => {
    //가짜 데이터
    if(dao.name == 'codestates-dao') {
      //[시연 생성] 없는 데이터만 등록
      dao.in_progress_suggestions = [];

      dao._pool_usage = 0;
      dao._num_of_own_nft = 0;
      dao._num_of_lend_nft = 0;
      dao._user_staking = dao.balance;
      dao._num_of_total_buy = 0;
      dao._num_of_total_sell = 0;
      dao._num_of_total_suggestions = 0;
      dao._ratio_of_vote_pass = 0;
      dao._num_of_pool_use = 0;
      dao._num_of_pool_useble = dao.balance;
      dao._my_ratio = 100;
      dao._my_value = dao.balance;
      dao._my_rewards = 0;
      dao._my_staking = dao.balance;
      dao._my_input = dao.balance;
      dao._my_output = 0;
    }
    else if(dao.name == 'korean whales') {
      //[시연 view] 모든 정보 상세 페이지와 sync
      dao.num_of_members = 13;
      dao.balance = 670.12;
      dao.rewards = "340.55";
      dao.createdAt = dao.createdAt;
      dao.in_progress_suggestions = [1,2,3,4,5];

      dao._pool_usage = 62.69;
      dao._num_of_own_nft = 13;
      dao._num_of_lend_nft = 5;
      dao._user_staking = 434;
      dao._num_of_total_buy = 18;
      dao._num_of_total_sell = 7;
      dao._num_of_total_suggestions = 54;
      dao._ratio_of_vote_pass = 84;
      dao._num_of_pool_use = 420.12;
      dao._num_of_pool_useble = 250;
      dao._my_ratio = 4.84;
      dao._my_value = 32.43;
      dao._my_rewards = 12.43;
      dao._my_staking = 20;
      dao._my_input = 32;
      dao._my_output = 12;

    } else {
      // 모두 랜덤
      dao.in_progress_suggestions = [];
      dao._pool_usage = 0;
      dao._num_of_own_nft = 0;
      dao._num_of_lend_nft = 0;
    }

    return dao;
  }

  const getCollection = async () => {
    if (symbol) {
      const {
        data: { data: dao },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/dao/${symbol}`);
      //alert(JSON.stringify(dao));
      //dao 테스트 DATA 세팅 필요
      let daoRawData = setDummyData(dao);
      setCollection(daoRawData);
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

      <Divider style={{ margin: "10px 0 40px 0" }} />

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
              height: "500px", overflow: "hidden", padding: "0 10px",
            }}>
              <div>    
                <Text style={{ fontSize: "34px", fontWeight: "bold", marginRight: "10px" }} align="left">
                  요약
                </Text>
              </div>
              <CTable highlightOnHover>
                <tbody>
                  <tr style={{ 
                    cursor: "pointer",
                  }}
                  >
                    <td style={{ fontSize: "20px", width: "20%" }}>Total Profits</td>
                    <td style={{ fontSize: "30px", width: "30%" }}>
                      <div style={{ display: "flex" }}>
                          <Image src="/images/eth.svg" width={12} height={12} alt="" />
                          <span style={{ marginLeft: "5px" }}>
                          <span style={{color:"red"}}>{dao?.rewards}</span>
                          </span>
                      </div>
                    </td>
                    <td style={{ fontSize: "20px", width: "20%" }}></td>
                    <td style={{ fontSize: "30px", width: "30%" }}></td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                  <td style={{ fontSize: "20px", width: "20%" }}>총 사용자 Staking</td>
                    <td style={{ fontSize: "30px", width: "30%" }}>
                      <div style={{ display: "flex" }}>
                        <Image src="/images/eth.svg" width={12} height={12} alt="" />
                        <span style={{ marginLeft: "5px" }}>
                          {dao?._user_staking}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: "20px"}}>현재 참여자</td>
                    <td style={{ fontSize: "30px"}}>{dao?.num_of_members}</td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td style={{ fontSize: "20px"}}>보유 중 NFT</td>
                    <td style={{ fontSize: "30px"}}>{dao?._num_of_own_nft}</td>
                    <td style={{ fontSize: "20px"}}>대여 중 NFT</td>
                    <td style={{ fontSize: "30px"}}>{dao?._num_of_lend_nft}</td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td style={{ fontSize: "20px"}}>총 구매 수</td>
                    <td style={{ fontSize: "30px"}}>{dao?._num_of_total_buy}</td>
                    <td style={{ fontSize: "20px"}}>총 판매 수</td>
                    <td style={{ fontSize: "30px"}}>{dao?._num_of_total_sell}</td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td style={{ fontSize: "20px"}}>진행 중인 투표 수</td>
                    <td style={{ fontSize: "30px"}}><span style={{color:"red"}}>{dao?.in_progress_suggestions.length}</span></td>
                    <td style={{ fontSize: "20px"}}>종료된 투표 수</td>
                    <td style={{ fontSize: "30px"}}><span style={{color:"red"}}>{dao?._num_of_total_suggestions}</span></td>
                  </tr>
                  <tr style={{ cursor: "pointer" }}>
                    <td style={{ fontSize: "20px"}}>투표 찬성률</td>
                    <td style={{ fontSize: "30px"}}>{dao?._ratio_of_vote_pass} %</td>
                    <td style={{ fontSize: "20px"}}>현재 구매 제안 건</td>
                    <td style={{ fontSize: "30px"}}>0</td>
                  </tr>
                </tbody>
              </CTable>

            </div>
          </CollectionWrapper>


        </Grid.Col>

        <Grid.Col
          span={3}
          md={3}
          lg={3}    
        >
          <CollectionWrapper
            style={{
              width: 400,
              margin: "20px auto",
              border: "1px solid rgb(229, 232, 235)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                marginTop: "10px",
                marginLeft: "auto",
                marginRight: "auto",
                width: "240px",
                height: "240px",
                backgroundImage: `url('https://parallel.fi/old/assets/images/sections/margin/icon02.svg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div>
              <div style={{ display: "flex", margin: "15px auto", width: "100%", height: "90px" }}>
                <StatBox style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", borderRightWidth: "0px" }}>
                  <StatCount>
                    <div style={{ display: "flex" }}>
                      <Image src="/images/eth.svg" width={12} height={12} alt="" />
                      <span style={{ marginLeft: "5px" }}>
                        {dao?.balance}
                      </span>
                    </div>
                  </StatCount>
                  <StatTitle>Total Pool</StatTitle>
                </StatBox>
                <StatBox style={{ borderTopLeftRadius: "8px"}}>
                  <StatCount>
                    <div style={{ display: "flex" }}>
                      <Image src="/images/eth.svg" width={12} height={12} alt="" />
                      <span style={{ marginLeft: "5px" }}>
                        {dao?._num_of_pool_use}
                      </span>
                    </div>
                  </StatCount>
                  <StatTitle>사용 중</StatTitle>
                </StatBox>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", margin: "15px auto", width: "100%", height: "90px" }}>
                <StatBox style={{ borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", borderRightWidth: "0px" }}>
                  <StatCount>{dao?._pool_usage } %</StatCount>
                  <StatTitle>사용률</StatTitle>
                </StatBox>
                <StatBox style={{ borderTopLeftRadius: "8px"}}>
                  <StatCount>
                    <div style={{ display: "flex" }}>
                      <Image src="/images/eth.svg" width={12} height={12} alt="" />
                      <span style={{ marginLeft: "5px" }}>
                      <span style={{color:"red"}}>{dao?._num_of_pool_useble }</span>
                      </span>
                    </div>
                  </StatCount>
                  <StatTitle>사용 가능 Pool</StatTitle>
                </StatBox>
              </div>
            </div>


          </CollectionWrapper>
        </Grid.Col>
      </SimpleGrid>
      <Container>
        <CTabs
          style={{ fontSize: "20px" }}
          color="blue"
          tabPadding="md"
          position="center"
        >
          <CTabs.Tab icon={<MdOutlineCollections style={{ width: 18, height: 18 }} />} label="나의 현황">
            <div>
              <Text style={{ fontSize: "34px", fontWeight: "bold", marginRight: "10px" }} align="left">
                나의 현황
              </Text>
              <div>
                <p>내 지분(%): {dao?._my_ratio} %</p>
                <p>내 현재 지분: {dao?._my_value} eth</p>
                <p>내 수익: {dao?._my_rewards} eth</p>
                <p>내 투자 금액: {dao?._my_staking} eth</p>
                <p>총 입금: {dao?._my_input} eth</p>
                <p>총 출금: {dao?._my_output} eth</p>
              </div>
            </div>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineFormatPaint style={{ width: 18, height: 18 }} />} label="투표 관리">
            <Text style={{ fontSize: "34px", fontWeight: "bold", marginRight: "10px" }} align="left">
              TBD
            </Text>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineSell style={{ width: 18, height: 18 }} />} label="NFT 관리">
            <Text style={{ fontSize: "34px", fontWeight: "bold", marginRight: "10px" }} align="left">
              TBD
            </Text>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineHistory style={{ width: 18, height: 18 }} />} label="참여자 관리">
            <Text style={{ fontSize: "34px", fontWeight: "bold", marginRight: "10px" }} align="left">
              TBD
            </Text>
          </CTabs.Tab>
        </CTabs>
        </Container>
    </div>
  );
};

export default NFTS;

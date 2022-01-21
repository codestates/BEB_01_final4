import { Button, Text } from "@mantine/core";
import styled from "styled-components";
import { useStore } from "../utils/store";
import { SimpleGrid, Tabs } from "@mantine/core";
import {
  MdOutlineCollections,
  MdOutlineCollectionsBookmark,
  MdOutlineFormatPaint,
  MdOutlineSell,
  MdOutlineHistory,
} from "react-icons/md";
import CollectionCard from "../components/CollectionCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NFTCard from "../components/nftCard";
import History from "../components/history";
import RentHistory from "../components/rent_history";
import { compressAddress } from "../utils";

const Description = styled.div`
  max-width: 720px;
  margin: 10px auto;
`;

const Container = styled.div`
  max-width: 100%;
  padding: 20px 0;
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

const MyPage = () => {
  const account = useStore((state) => state.account);
  const [myData, setMyData] = useState(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [createdAssets, setCreatedAssets] = useState([]);
  const [sellingAssets, setSellingAssets] = useState([]);
  const [activityAssets, setActivityAssets] = useState([]);
  const [lendAssets, setLendAssets] = useState([]);
  const [rentAssets, setRentAssets] = useState([]);
  const [rentHistoryAssets, setRentHistoryAssets] = useState([]);

  const getDataOnTabChange = async () => {
    if (activeTab === 0) {
      // My Collections
    } else if (activeTab === 1) {
      // Collected
    } else if (activeTab === 2) {
      // Created
      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=mint`);
      console.log(myData);
      setCreatedAssets(myData.assets);
    } else if (activeTab === 3) {
      // For Sale
      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=selling`);
      setSellingAssets(myData.assets);
    } else if (activeTab === 4) {
      // Trade History
      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=history`);
      console.log(myData);
      setActivityAssets(myData.trades);
    } else if (activeTab === 5) {
      // For Rent
      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=lend`);
      setLendAssets(myData.assets);
    } else if (activeTab === 6) {
      // 대여 중인
      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=rent`);
      setRentAssets(myData.assets);
    } else if (activeTab === 7) {
      // 대여 내역
      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=rent-history`);
      setRentHistoryAssets(myData.rents);
    }

    // else if (activeTab === 5) {
    //   // Canceled
    //   const {
    //     data: { data: myData },
    //   } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}?tab=canceled`);
    //   console.log(myData);
    // }
  };

  useEffect(() => {
    getDataOnTabChange();
  }, [activeTab]);

  const getMyData = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/users`, { address: account });

      const {
        data: { data: myData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}`);
      console.log(myData);
      setMyData(myData);
    } catch (e) {
      console.log(e.response);
    }
  };

  useEffect(() => {
    getMyData();
    if (!account) {
      alert("지갑을 연결해주세요.");
    }
  }, [account]);

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "220px",
          backgroundImage: `url(/images/nft-bg.jpg)`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      <div
        style={{
          marginTop: "-63px",
          marginLeft: "auto",
          marginRight: "auto",
          width: "126px",
          height: "126px",
          backgroundImage: `url(/images/profile20.png)`,
          backgroundSize: "cover",
          borderRadius: "50%",
          border: "1px solid white",
        }}
      ></div>
      <Description>
        <Text style={{ textAlign: "center", fontSize: "38px", fontWeight: "bold" }}>Unnamed</Text>
        {account && (
          <Text style={{ textAlign: "center", fontSize: "20px", margin: "5px 0" }}>{`${compressAddress(
            account,
          )}`}</Text>
        )}
      </Description>
      <Container>
        <CTabs
          style={{ fontSize: "20px" }}
          active={activeTab}
          onTabChange={setActiveTab}
          color="teal"
          tabPadding="md"
          position="center"
        >
          <CTabs.Tab icon={<MdOutlineCollectionsBookmark style={{ width: 18, height: 18 }} />} label="My Collections">
            <div style={{ padding: "0 40px" }}>
              <Text style={{ fontSize: "48px", fontWeight: "bold" }}>My Collections</Text>
              <Text style={{ fontSize: "20px", margin: "20px 0" }}>
                Create, curate, and manage collections of unique NFTs to share and sell.
              </Text>
              <Button
                style={{ fontSize: "26px", marginBottom: "20px" }}
                color="teal"
                size="xl"
                onClick={() => router.push("/create-collection")}
              >
                Create a collection
              </Button>
            </div>

            <SimpleGrid
              style={{ padding: "0 30px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1250, cols: 2, spacing: "md" },
                { maxWidth: 850, cols: 1, spacing: "sm" },
              ]}
            >
              {myData?.collections?.map((collection) => (
                <CollectionCard collection={collection} key={collection.id} />
              ))}
            </SimpleGrid>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineCollections style={{ width: 18, height: 18 }} />} label="Collected">
            <SimpleGrid
              style={{ padding: "0 80px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1160, cols: 2, spacing: "md" },
                { maxWidth: 840, cols: 1, spacing: "sm" },
              ]}
            >
              {myData?.assets.map((nft, i) => {
                return nft.imageURI === null ? null : (
                  <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />
                );
              })}
            </SimpleGrid>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineFormatPaint style={{ width: 18, height: 18 }} />} label="Created">
            <SimpleGrid
              style={{ padding: "0 80px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1160, cols: 2, spacing: "md" },
                { maxWidth: 840, cols: 1, spacing: "sm" },
              ]}
            >
              {createdAssets.map((nft, i) => {
                console.log(nft);
                return nft.imageURI === null ? null : (
                  <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />
                );
              })}
            </SimpleGrid>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineSell style={{ width: 18, height: 18 }} />} label="For Sale">
            <SimpleGrid
              style={{ padding: "0 80px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1160, cols: 2, spacing: "md" },
                { maxWidth: 840, cols: 1, spacing: "sm" },
              ]}
            >
              {sellingAssets.map((nft, i) => {
                // console.log(nft);
                return nft.imageURI === null ? null : <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />;
              })}
            </SimpleGrid>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineHistory style={{ width: 18, height: 18 }} />} label="Activity">
            <History elements={activityAssets} />
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineSell style={{ width: 18, height: 18 }} />} label="For Rent">
            <div style={{ padding: "0 40px" }}>
              <Text style={{ fontSize: "36px", fontWeight: "bold" }}>대여 등록한 내 NFT</Text>
              <Text style={{ fontSize: "20px", margin: "20px 0" }}>
                다른 사람이 대여하여 사용할 수 있도록 마켓 플레이스에 등록한 내 NFT 리스트입니다.
              </Text>
            </div>

            <SimpleGrid
              style={{ padding: "0 80px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1160, cols: 2, spacing: "md" },
                { maxWidth: 840, cols: 1, spacing: "sm" },
              ]}
            >
              {lendAssets.map((nft, i) => {
                // console.log(nft);
                return nft.imageURI === null ? null : <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />;
              })}
            </SimpleGrid>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineSell style={{ width: 18, height: 18 }} />} label="Rental">
            <div style={{ padding: "0 40px" }}>
              <Text style={{ fontSize: "36px", fontWeight: "bold" }}>대여 중인 NFT</Text>
              <Text style={{ fontSize: "20px", margin: "20px 0" }}>
                다른 사람 소유의 NFT 를 fee 를 지불하여 대여 사용 중인 NFT 리스트입니다.
              </Text>
            </div>

            <SimpleGrid
              style={{ padding: "0 80px" }}
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 1160, cols: 2, spacing: "md" },
                { maxWidth: 840, cols: 1, spacing: "sm" },
              ]}
            >
              {rentAssets.map((nft, i) => {
                // console.log(nft);
                return nft.imageURI === null ? null : <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />;
              })}
            </SimpleGrid>
          </CTabs.Tab>
          <CTabs.Tab icon={<MdOutlineHistory style={{ width: 18, height: 18 }} />} label="Rental-History">
            <div style={{ padding: "0 40px" }}>
              <Text style={{ fontSize: "36px", fontWeight: "bold" }}>대여 내역</Text>
              <Text style={{ fontSize: "20px", margin: "20px 0" }}>
                대여하여 사용했거나, 내 NFT 를 대여해 준 내역입니다.
              </Text>
            </div>

            <RentHistory elements={rentHistoryAssets} />
          </CTabs.Tab>

          {/* <CTabs.Tab icon={<MdOutlineCancelPresentation style={{ width: 18, height: 18 }} />} label="Canceled">
            Third tab content
          </CTabs.Tab> */}
        </CTabs>
      </Container>
    </div>
  );
};

export default MyPage;

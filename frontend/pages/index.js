import axios from "axios";
import { useEffect, useState } from "react";

import RankingCard from "../components/rankingCard";
import { Divider, SimpleGrid } from "@mantine/core";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Caver from "caver-js";

const Main = () => {
  const [ranking, setRanking] = useState(null);
  const [topUsers, setTopUsers] = useState(null);

  const getRanking = async () => {
    try {
      const {
        data: { data: ranking },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/main/trades?sort=price-high&status=completed`);
      setRanking(ranking);

      const {
        data: { data: topUsers },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/main/topUser`);
      // console.log(topUsers);
      setTopUsers(topUsers);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getRanking();
  }, []);

  return (
    <main>
      {/* <header style={{backgroundImage: "url(/images/main.png)", backgroundPosition: "center top", backgroundRepeat: "no-repeat", position: "relative" }}> */}
      <div>
        <Carousel
          style={{ height: "500px" }}
          emulateTouch={true}
          autoPlay={true}
          showArrows={true}
          showThumbs={false}
          width="100%"
        >
          <div>
            {/* <Image layout="fill" src="/images/carousel1.jpeg" alt="" /> */}
            <img src="/images/klaycity.jpeg" alt="" />
          </div>
          <div>
            {/* <Image layout="fill" src="/images/carousel1.jpeg" alt="" /> */}
            <img src="/images/carousel1 (1).jpeg" alt="" />
          </div>
          <div>
            {/* <Image layout="fill" src="/images/carousel2.png" alt="" /> */}
            <img src="/images/carousel2 (1).png" alt="" />
          </div>
          <div>
            {/* <Image layout="fill" src="/images/carousel3.jpeg" alt="" /> */}
            <img src="/images/carousel3 (1).jpeg" alt="" />
          </div>
        </Carousel>
      </div>
      <div style={{ textAlign: "center" }}>
        <img style={{ marginTop: "40px", height: "500px", position: "center" }} src="/images/main.png" />
      </div>
      <div
        style={{
          paddingTop: "1oopx",
          color: "#9986EE",
          fontSize: "70px",
          textAlign: "center",
          textShadow: "3px 3px 3px #A0A0C8",
        }}
      >
        NFT GGANBU
      </div>
      <div style={{ marginTop: "12px", fontSize: "30px", textAlign: "center" }}>NFT, 더 이상 혼자 사지 마세요</div>
      <Divider style={{ margin: "60px 0 60px 0" }} />
      <div style={{ marginTop: "15px", fontSize: "30px", textAlign: "center" }}>가장 비싸게 팔린 NFT TOP 3</div>
      <SimpleGrid
        style={{ padding: "0 80px" }}
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 1160, cols: 2, spacing: "md" },
          { maxWidth: 840, cols: 1, spacing: "sm" },
        ]}
      >
        {ranking?.map((rank, i) => {
          return rank.asset.imageURI === null ? null : (
            <RankingCard key={i} rankInfo={rank} index={i} category={"nft"} />
          );
        })}
      </SimpleGrid>
      <Divider style={{ margin: "60px 0 60px 0" }} />
      <div style={{ marginTop: "15px", fontSize: "30px", textAlign: "center" }}>TOP USER 3</div>
      <SimpleGrid
        style={{ padding: "0 80px" }}
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: 1160, cols: 2, spacing: "md" },
          { maxWidth: 840, cols: 1, spacing: "sm" },
        ]}
      >
        {topUsers?.map((user, i) => {
          return <RankingCard key={i} rankInfo={user} index={i} category={"user"} />;
        })}
      </SimpleGrid>
      <Divider style={{ margin: "60px 0 60px 0" }} />
    </main>
  );
};

export default Main;

import { Text } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react/cjs/react.development";
import GGanbuBoard from "../components/gganbuBoard";

const GGanbu = () => {
  const [gganbuList, setGGanbuList] = useState([]);

  const getGGanbuList = async () => {
    const {
      data: { data: gganbuList },
    } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gganbu?tab=recruit`, {
      withCredentials: true,
    });

    console.log(gganbuList);
    setGGanbuList(gganbuList);
  };

  useEffect(() => {
    getGGanbuList();
  }, []);

  return (
    <div>
      <Text align="center" style={{ fontSize: "32px", margin: "30px 0 80px 0" }}>
        깐부 모집 중
      </Text>
      <GGanbuBoard gganbuList={gganbuList} />
    </div>
  );
};

export default GGanbu;

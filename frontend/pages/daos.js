import { SimpleGrid, Text } from "@mantine/core";
import DaoCard from "../components/DaoCard";
import { useEffect, useState } from "react";
import axios from "axios";
// import GGanbuBoard from "../components/gganbuBoard";
import DaoBoard from "../components/daoBoard";

const DAOs = () => {
  const [daos, setDaos] = useState([]);

  const getDaos = async () => {
    const {
      data: { data: daos },
    } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/dao?tab=operate`);
    console.log(daos);
    setDaos(daos);
  };

  useEffect(() => {
    getDaos();
  }, []);

  return (
    <div>
      <Text align="center" style={{ fontSize: "32px", margin: "30px 0 80px 0" }}>
        Explore D A O
      </Text>
      <DaoBoard daoList={daos} />
    </div>
  );
};

export default DAOs;

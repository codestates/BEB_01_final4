import { useState, useEffect } from "react";
import { SimpleGrid } from "@mantine/core";
import NFTCard from "../../nftCard";
import { useStore } from "../../../utils/store";
import axios from "axios";

const GGanbuNFT = ({ activeSubTab }) => {
  const [gganbuNftList, setGGanbuNftList] = useState([]);
  const account = useStore((state) => state.account);

  const getGGanbuNftList = async () => {
    const {
      data: { data: gganbuNftList },
    } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/gganbu?user=${account}&tab=own`);
    console.log(gganbuNftList);
    setGGanbuNftList(gganbuNftList);
  };

  useEffect(() => {
    getGGanbuNftList();
  }, [account, activeSubTab]);

  return (
    <SimpleGrid
      style={{ padding: "0 80px" }}
      cols={3}
      spacing="lg"
      breakpoints={[
        { maxWidth: 1160, cols: 2, spacing: "md" },
        { maxWidth: 840, cols: 1, spacing: "sm" },
      ]}
    >
      {gganbuNftList.map((nft, i) => {
        // console.log(nft);
        return nft.imageURI === null ? null : (
          <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />
        );
      })}
    </SimpleGrid>
  );
};

export default GGanbuNFT;

import { useState, useEffect } from "react";
import { Button, Image, Input, Modal, SimpleGrid, Text, TextInput } from "@mantine/core";
import NFTCard from "../../nftCard";
import { useStore } from "../../../utils/store";
import axios from "axios";
import { useInputState } from "@mantine/hooks";
import styled from "styled-components";
import { Coffer } from "../../../public/compiledContracts/Coffer";

const CInput = styled(Input)`
  margin: 0 !important;
  && input {
    text-align: right;
    margin: 10px 0 20px 0;
  }

  width: 90%;
`;

const GGanbuNFT = ({ activeSubTab }) => {
  const [gganbuNftList, setGGanbuNftList] = useState([]);
  const account = useStore((state) => state.account);
  const [selectedNft, setSelectedNft] = useState(null);
  const [opened, setOpened] = useState(false);
  const [sellPrice, setSellPrice] = useInputState("");
  const web3 = useStore((state) => state.web3);

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

  const handleRequestSell = async () => {
    // console.log(first);
    if (!sellPrice) {
      alert("판매 제안 금액을 입력해주세요.");
      return;
    }

    // console.log(
    //   1,
    //   1,
    //   selectedNft?.asset?.collection?.contractAddress,
    //   selectedNft?.asset?.token_ids,
    //   web3.utils.toWei(sellPrice, "ether"),
    // );

    const cofferContract = await new web3.eth.Contract(Coffer.abi, selectedNft?.gganbuAddress);
    const txResult = await cofferContract.methods
      .requestTrade(
        1,
        1,
        selectedNft?.asset?.collection?.contractAddress,
        selectedNft?.asset?.token_ids,
        web3.utils.toWei(sellPrice, "ether"),
      ) //  uint8 _type(1: 판매), uint256 _idx(공동 월렛에서 몇 번째 구매한 nft인지, 1부터 시작), address _collection, uint256 _tokenId, uint256 _price
      .send({ from: account });

    let event = await cofferContract.getPastEvents("set_suggestion", {
      fromBlock: txResult.blockNumber,
      toBlock: txResult.blockNumber,
    });

    let log = event.find((log) => log.transactionHash == txResult.transactionHash);

    console.log(log.returnValues);

    setOpened(false);
    setSellPrice("");
  };

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
          <div key={i}>
            <NFTCard key={i} collectionSymbol={nft?.collection?.symbol} nft={nft} idx={i} />
            <div style={{ textAlign: "center" }}>
              <Button
                onClick={() => {
                  setOpened(true);
                  setSelectedNft(nft);
                }}
              >
                판매 제안
              </Button>
            </div>
          </div>
        );
      })}
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <Text style={{ fontSize: "20px", fontWeight: "bold" }} align="center">
          판매 제안
        </Text>

        <div style={{ margin: "20px 0" }}>
          <Text>금액</Text>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CInput
              value={sellPrice}
              onChange={setSellPrice}
              style={{ margin: "20px 0" }}
              placeholder="판매 제안 금액"
              required
              type="number"
            />
            <Text style={{ marginLeft: "10px" }}>ETH</Text>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <Button onClick={handleRequestSell}>확인</Button>
        </div>
      </Modal>
    </SimpleGrid>
  );
};

export default GGanbuNFT;

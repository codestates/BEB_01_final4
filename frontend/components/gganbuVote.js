import { Badge, Button, Modal, Table, Text } from "@mantine/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Coffer } from "../public/compiledContracts/Coffer";
import { useStore } from "../utils/store";

const CTable = styled(Table)`
  && td {
    font-size: 20px;
  }

  && th {
    font-size: 18px;
  }
`;

const GGanbuVote = ({ suggestions }) => {
  const [opened, setOpened] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const account = useStore((state) => state.account);
  const web3 = useStore((state) => state.web3);

  const getCoffer = async () => {
    const cofferContract = await new web3.eth.Contract(Coffer.abi, selectedSuggestion?.orgAddress);

    console.log(cofferContract);
  };

  useEffect(() => {
    getCoffer();
  }, []);

  const handleVote = async (vote) => {
    const cofferContract = await new web3.eth.Contract(Coffer.abi, selectedSuggestion?.orgAddress);
    const txResult = await cofferContract.methods
      .vote(selectedSuggestion?.suggestion_idx, vote)
      .send({ from: account });

    if (vote) {
      let event = await cofferContract.getPastEvents("pass", {
        fromBlock: txResult.blockNumber,
        toBlock: txResult.blockNumber,
      });

      console.log(event);
    } else {
      let event = await cofferContract.getPastEvents("reject", {
        fromBlock: txResult.blockNumber,
        toBlock: txResult.blockNumber,
      });

      console.log(event);
      setOpened(false);
    }
  };

  const rows = suggestions.map((suggestion, idx) => (
    <tr key={idx}>
      <td>{suggestion.gganbu.asset.name}</td>
      <td>
        <Image src={suggestion.gganbu.asset.imageURI} width={128} height={128} alt="" />
      </td>
      <td>
        <div style={{ display: "flex" }}>
          <Image src="/images/eth.svg" width={12} height={12} alt="" />
          <span style={{ marginLeft: "5px" }}>{suggestion.gganbu.asset.price}</span>
        </div>
      </td>
      <td>
        <div style={{ display: "flex" }}>
          <Image src="/images/eth.svg" width={12} height={12} alt="" />
          <span style={{ marginLeft: "5px" }}>{suggestion.gganbu.asset.recruiting.balance}</span>
        </div>
      </td>
      <td>{suggestion.gganbu.asset.description}</td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* 타입 종류 0:join , 1: sell, 2: rent, 3: pay */}
          <div>
            {suggestion.type === "join" && (
              <Badge style={{ fontSize: "14px" }} radius={4}>
                깐부 참여 건
              </Badge>
            )}
          </div>
          <div style={{ marginTop: "15px" }}>
            <Button
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setOpened(true);
              }}
            >
              투표하기
            </Button>
          </div>
        </div>
      </td>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        {console.log(selectedSuggestion)}
        {selectedSuggestion?.type === "join" && (
          <div>
            <Text style={{ fontSize: "18px" }} align="center">
              깐부 참여 건
            </Text>
            <div style={{ margin: "30px 0" }}>
              <Text>{`참여자: ${selectedSuggestion?.joiner}`}</Text>
              <div style={{ display: "flex" }}>
                <Text style={{ marginRight: "5px" }}>참여 금액:</Text>
                <Image src="/images/eth.svg" height={10} width={10} alt="" />
                <Text style={{ marginLeft: "5px" }}>{selectedSuggestion?.joiner_staking_value}</Text>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Button onClick={() => handleVote(true)}>찬성</Button>
          <Button onClick={() => handleVote(false)} color="red">
            반대
          </Button>
        </div>
      </Modal>
    </tr>
  ));

  return (
    <CTable>
      <thead>
        <tr>
          <th>name</th>
          <th>item</th>
          <th>판매금액</th>
          <th>모금액</th>
          <th>설명</th>
          <th style={{ textAlign: "center" }}>안건</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </CTable>
  );
};

export default GGanbuVote;
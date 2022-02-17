import { Badge, Button, Modal, Table, Text } from "@mantine/core";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Coffer } from "../../../public/compiledContracts/Coffer";
import { CofferForKlaytn } from "../../../public/compiledContracts/CofferForKlaytn";
import { useStore } from "../../../utils/store";

const CTable = styled(Table)`
  && td {
    font-size: 20px;
  }

  && th {
    font-size: 18px;
  }
`;

const GGanbuVote = ({ suggestions, setSuggestions }) => {
  const [opened, setOpened] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const account = useStore((state) => state.account);
  const web3 = useStore((state) => state.web3);
  const [caver, networkId] = useStore((state) => [state.caver, state.networkId]);

  const refetchSuggestions = async () => {
    const {
      data: { data: suggestions },
    } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/suggestions?user=${account}&tab=in-progress`);
    console.log(suggestions);
    setSuggestions(suggestions);
  };

  useEffect(() => {
    refetchSuggestions();
  }, [account]);

  const handleVote = async (vote) => {
    let txResult;
    let isKlaytn = networkId === 1001 || networkId === 8217;
    let cofferContract;

    if (isKlaytn) {
      cofferContract = await new caver.klay.Contract(CofferForKlaytn.abi, selectedSuggestion?.orgAddress);
      txResult = await cofferContract.methods
        .vote(selectedSuggestion?.suggestion_idx, vote)
        .send({ from: account, gas: 9000000 });
    } else {
      cofferContract = await new web3.eth.Contract(Coffer.abi, selectedSuggestion?.orgAddress);
      txResult = await cofferContract.methods.vote(selectedSuggestion?.suggestion_idx, vote).send({ from: account });
    }

    console.log(txResult);

    await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/transaction`,
      {
        transaction: txResult.transactionHash,
        networkType: isKlaytn ? "klaytn" : "ethereum",
      },
      {
        withCredentials: true,
      },
    );

    if (vote) {
      let event = await cofferContract.getPastEvents("pass", {
        fromBlock: txResult.blockNumber,
        toBlock: txResult.blockNumber,
      });

      console.log(event.returnValues);
    } else {
      let event = await cofferContract.getPastEvents("reject", {
        fromBlock: txResult.blockNumber,
        toBlock: txResult.blockNumber,
      });

      console.log(event.returnValues);
    }
    setOpened(false);
    // refetchSuggestions();
  };

  const rows = suggestions.map((suggestion, idx) => {
    return suggestion?.gganbu?.asset?.imageURI === null ? null : (
      <tr key={idx}>
        <td>{suggestion?.gganbu?.asset?.name}</td>
        <td>
          <Image src={suggestion?.gganbu?.asset?.imageURI} width={128} height={128} alt="" />
        </td>
        <td>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {suggestion?.gganbu?.asset?.price === null ? (
              "-"
            ) : (
              <>
                <Image src="/images/klay-logo.svg" width={25} height={25} alt="" />
                <span style={{ marginLeft: "5px" }}>{suggestion?.gganbu?.asset?.price}</span>
              </>
            )}
          </div>
        </td>
        <td>
          <div style={{ display: "flex" }}>
            <Image src="/images/klay-logo.svg" width={25} height={25} alt="" />
            <span style={{ marginLeft: "5px" }}>{suggestion?.gganbu?.balance}</span>
          </div>
        </td>
        <td>{suggestion?.gganbu?.asset?.description}</td>
        <td>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* 타입 종류 0:join , 1: sell, 2: rent, 3: pay */}
            <div>
              {suggestion?.type === "join" && (
                <Badge style={{ fontSize: "14px" }} radius={4}>
                  깐부 참여 건
                </Badge>
              )}
              {suggestion?.type === "sell" && (
                <Badge color="orange" style={{ fontSize: "14px" }} radius={4}>
                  NFT 판매 건
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
          {selectedSuggestion?.type === "join" && (
            <div>
              <Text style={{ fontSize: "18px" }} align="center">
                깐부 참여 건
              </Text>
              <div style={{ margin: "30px 0" }}>
                <Text>{`참여자: ${selectedSuggestion?.joiner}`}</Text>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Text style={{ marginRight: "5px" }}>참여 금액:</Text>
                  <Image src="/images/klay-logo.svg" height={25} width={25} alt="" />
                  <Text style={{ marginLeft: "5px" }}>{selectedSuggestion?.joiner_staking_value}</Text>
                </div>
              </div>
            </div>
          )}

          {selectedSuggestion?.type === "sell" && (
            <div>
              <Text style={{ fontSize: "18px" }} align="center">
                NFT 판매 건
              </Text>
              <div style={{ margin: "30px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center" }}>
                  {console.log(selectedSuggestion?.gganbu?.asset?.imageURI)}
                  <Image src={selectedSuggestion?.gganbu?.asset?.imageURI} width={128} height={128} alt="" />
                </div>

                <div style={{ display: "flex", marginTop: "20px", alignItems: "center" }}>
                  <Text style={{ marginRight: "5px" }}>판매 제안 금액:</Text>
                  <Image src="/images/klay-logo.svg" height={25} width={25} alt="" />
                  <Text style={{ marginLeft: "5px" }}>{selectedSuggestion?.targetPrice}</Text>
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
    );
  });

  return (
    <CTable>
      <thead>
        <tr>
          <th>name</th>
          <th>item</th>
          <th style={{ textAlign: "center" }}>판매금액</th>
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

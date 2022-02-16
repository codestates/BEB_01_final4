import { Button, Modal, Table, Text, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import Image from "next/image";
import { useState } from "react";
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

// const handleClick = async () => {
//   router.push(`/assets/${symbol}/${token_ids}`);
// };

const DaoBoard = ({ daoList }) => {
  // const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [selectedDao, setSelectedDao] = useState(null);
  const [amount, setAmount] = useInputState("");
  const [web3, account] = useStore((state) => [state.web3, state.account]);
  const [networkId] = useStore((state) => [state.networkId]);

  const handleJoinDao = async () => {
    if (!amount) {
      alert("참여 금액을 입력해주세요.");
      return;
    }
    console.log(selectedDao);

    const cofferContract = await new web3.eth.Contract(Coffer.abi, selectedDao?.daoAddress);
    const txResult = await cofferContract.methods
      .requestJoin(0) // TODO: 0이면 공동구매 하기위해 들어옴, 1이면 그냥 wallt 가입(지분 안 넣고?)
      .send({ from: account, value: web3.utils.toWei(amount, "ether") });

    let event = await cofferContract.getPastEvents("set_suggestion", {
      fromBlock: txResult.blockNumber,
      toBlock: txResult.blockNumber,
    });

    let log = event.find((log) => log.transactionHash == txResult.transactionHash);
    console.log(log.returnValues);

    setOpened(false);
    setAmount("");
  };

  const rows = daoList.map((dao, idx) => {
    const members = dao.members.map((member) => member.memberAddress);

    if (Object.keys(dao).length === 0) {
      return null;
    }
    return (
      <tr style={{ cursor: "pointer" }} key={idx}>
        <td>{dao?.name}</td>
        <td style={{ textAlign: "center" }}>{dao?.num_of_members}</td>
        <td>
          <div style={{ display: "flex" }}>
            <Image
              src={`${networkId === 1001 || networkId === 8217 ? "/images/klay.svg" : "/images/eth.svg"}`}
              width={30}
              height={30}
              alt=""
            />
            <span style={{ marginLeft: "5px" }}>
              {Math.round(parseFloat(dao?.members?.reduce((acc, cur) => acc + cur.staking_value, 0)) * 100) / 100}
            </span>
          </div>
        </td>
        <td>{dao?.description}</td>
        <td style={{ textAlign: "center" }}>
          {members.includes(account) ? (
            <small>가입 상태</small>
          ) : (
            <Button
              onClick={() => {
                // TODO: 이미 가입한 dao면 alert 띄우고 스킵해야함
                // console.log(dao);

                if (members.includes(account)) {
                  alert("이미 가입한 DAO입니다.");
                  return;
                }

                setOpened(true);
                setSelectedDao(dao);
              }}
            >
              가입하기
            </Button>
          )}
        </td>
      </tr>
    );
  });

  return (
    <CTable highlightOnHover>
      <thead>
        <tr>
          <th>name</th>
          <th style={{ textAlign: "center" }}>가입자 수</th>
          <th>모금액</th>
          <th>설명</th>
          <th style={{ textAlign: "center" }}>가입</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <Text style={{ fontSize: "20px", fontWeight: "bold" }} align="center">
          DAO 가입
        </Text>

        <TextInput
          value={amount}
          onChange={setAmount}
          style={{ margin: "20px 0" }}
          placeholder={`${networkId === 1001 || networkId === 8217 ? "KLAY" : "ETH"}`}
          label="참여 금액"
          required
          type="number"
        />

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button onClick={handleJoinDao}>확인</Button>
        </div>
      </Modal>
    </CTable>
  );
};

export default DaoBoard;

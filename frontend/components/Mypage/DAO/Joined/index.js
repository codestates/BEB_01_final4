import { Button, Modal, Text, Textarea, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import axios from "axios";
import { useEffect, useState } from "react";
import { Coffer } from "../../../../public/compiledContracts/Coffer";
import { CofferForKlaytn } from "../../../../public/compiledContracts/CofferForKlaytn";
import { useStore } from "../../../../utils/store";
import MyDaoTable from "./myDaoTable";

const DoJoined = ({ activeSubTab }) => {
  const [web3, account, networkId] = useStore((state) => [state.web3, state.account, state.networkId]);
  const [opened, setOpened] = useState(false);
  const [name, setName] = useInputState("");
  const [amount, setAmount] = useInputState("");
  const [description, setDescription] = useInputState("");
  const [myDaos, setMyDao] = useState([]);
  const caver = useStore((state) => state.caver);

  const getMyDaos = async () => {
    if (account) {
      const {
        data: { data: myDaos },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/dao?user=${account}`, { withCredentials: true });
      console.log(myDaos);
      setMyDao(myDaos);
      // name, description, balance, num_of_members, members[]
    }
  };

  useEffect(() => {
    getMyDaos();
  }, [account, activeSubTab]);

  const handleCreateDAO = async () => {
    // console.log(name);
    // console.log(description);
    let isKlaytn = networkId === 1001 || networkId === 8217;
    let cofferContract;

    if (isKlaytn) {
      cofferContract = await new caver.klay.Contract(CofferForKlaytn.abi)
        .deploy({
          data: CofferForKlaytn.bytecode,
          arguments: ["0x0000000000000000000000000000000000000000", 0, 0, 4],
        })
        .send({ from: account, gas: 9000000, value: caver.utils.toPeb(amount, "KLAY") });
    } else {
      cofferContract = await new web3.eth.Contract(Coffer.abi)
        .deploy({
          data: Coffer.bytecode,
          arguments: ["0x0000000000000000000000000000000000000000", 0, 0, 4],
        })
        .send({ from: account, value: web3.utils.toWei(amount, "ether") });
    }

    console.log(cofferContract);
    // console.log(cofferContract._address);

    // console.log({ daoAddress: cofferContract._address, name, description });

    if (cofferContract._address) {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/dao`,
        {
          userAddress: account,
          daoAddress: cofferContract._address,
          name,
          description,
        },
        { withCredentials: true },
      );
    }

    setOpened(false);
    setName("");
    setDescription("");

    getMyDaos();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <Text style={{ fontSize: "36px", fontWeight: "bold", margin: "20px 0" }}>가입한 subDAO</Text>
        <Button
          style={{ fontSize: "26px", marginLeft: "60px" }}
          color="teal"
          size="lg"
          onClick={() => {
            setOpened(true);
          }}
        >
          DAO 만들기
        </Button>
      </div>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <Text style={{ fontSize: "20px", fontWeight: "bold" }} align="center">
          DAO 생성
        </Text>

        <TextInput
          value={name}
          onChange={setName}
          style={{ margin: "20px 0" }}
          placeholder="DAO 이름"
          label="DAO 이름"
          required
        />
        <Textarea value={description} onChange={setDescription} placeholder="DAO 설명" label="DAO 설명" required />

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
          <Button onClick={handleCreateDAO}>생성</Button>
        </div>
      </Modal>

      <MyDaoTable myDaos={myDaos} />
    </div>
  );
};

export default DoJoined;

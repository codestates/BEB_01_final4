import { Button, Modal, Text, Textarea, TextInput } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import axios from "axios";
import { useEffect, useState } from "react";
import { Coffer } from "../../../../public/compiledContracts/Coffer";
import { useStore } from "../../../../utils/store";

const Joined = () => {
  const [web3, account] = useStore((state) => [state.web3, state.account]);
  const [opened, setOpened] = useState(false);
  const [name, setName] = useInputState("");
  const [description, setDescription] = useInputState("");

  // const getMyDAO = async () => {
  //   if (account) {
  //     await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/dao?user=${account}`, { withCredentials: true });
  //   }
  // };

  // useEffect(() => {
  //   getMyDAO();
  // }, [account]);

  const handleCreateDAO = async () => {
    // console.log(name);
    // console.log(description);

    const cofferContract = await new web3.eth.Contract(Coffer.abi)
      .deploy({
        data: Coffer.bytecode,
        arguments: ["0x0000000000000000000000000000000000000000", 0, 0, 4],
      })
      .send({ from: account });

    // console.log(cofferContract);
    // console.log(cofferContract._address);

    console.log({ daoAddress: cofferContract._address, name, description });
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
  };

  return (
    <div>
      <Text style={{ fontSize: "36px", fontWeight: "bold", margin: "20px 0" }}>가입한 subDAO</Text>
      <Button
        onClick={() => {
          setOpened(true);
        }}
      >
        DAO 만들기
      </Button>
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
        {/* <TextInput
          value={description}
          onChange={setDescription}
          style={{ margin: "20px 0" }}
          placeholder="DAO 설명"
          label="DAO 설명"
          required
          type="text"
        /> */}
        <Textarea value={description} onChange={setDescription} placeholder="DAO 설명" label="DAO 설명" required />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button onClick={handleCreateDAO}>생성</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Joined;

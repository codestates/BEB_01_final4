import { Button, Input, Select, Text } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import UploadFile from "../components/uploadFile";
import { GGanbuCollection } from "../public/compiledContracts/GGanbuCollection";
import { useStore } from "../utils/store";
import { isHangul, toInputAlphabetDecimal } from "./create-collection";

const Container = styled.div`
  && {
    max-width: 600px;
    margin: 30px auto;
  }
  && .mantine-Text-root {
    font-size: 24px !important;
  }

  && .title {
    font-size: 35px !important;
  }

  && input {
    font-size: 18px;
  }
`;

const TitleInput = styled.div`
  margin: 20px 0;

  .mantine-Text-root {
    margin-bottom: 10px;
  }
`;

export const hangulToAlphabet = (e) => {
  e.target.value = ("" + e.target.value).replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, "");
};

const MintNFT = () => {
  const router = useRouter();
  const [myCollections, setMyCollections] = useStore((state) => [state.myCollections, state.setMyCollections]);
  const [name, setName] = useInputState("");
  const [description, setDescription] = useInputState("");
  const [imageURI, setImageURI] = useState("");
  const [symbol, setSymbol] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const account = useStore((state) => state.account);
  const web3 = useStore((state) => state.web3);

  const handleCreate = async ({ ownerAddress, contractAddress, name, description, imageURI }) => {
    // console.log(collection);

    if (!ownerAddress || !contractAddress || !name || !description || !imageURI) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    const newNFT = {
      ownerAddress,
      contractAddress,
      name,
      description,
      traits: JSON.stringify([]),
      imageURI,
    };
    console.log(newNFT);

    // console.log(newNFT);

    try {
      const {
        data: {
          data: { tokenURI },
        },
      } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/assets`, newNFT, {
        withCredentials: true,
      });

      console.log(tokenURI);
      if (tokenURI) {
        const contract = await new web3.eth.Contract(GGanbuCollection.abi, contractAddress, {
          from: account,
        });

        const result = await contract.methods.mintNFT(tokenURI).send({ from: account });

        console.log(result);
        if (result) {
          let event = await contract.getPastEvents("Transfer", {
            fromBlock: result.blockNumber,
            toBlock: result.blockNumber,
          });

          let log = event.find((log) => log.transactionHash == result.transactionHash);
          console.log(log.returnValues.tokenId); // tokenId 출력
        }

        router.push(`/collections/${symbol}`);
      }
    } catch (e) {
      console.log(e);
      console.dir(e);
      if (e.response?.data?.message !== undefined) {
        alert(e.response?.data?.message);
      }
    }
  };

  const getMyCollections = async () => {
    if (!account) {
      alert("지갑을 연결해주세요.");
      return;
    }

    try {
      const {
        data: { data: myCollectionsData },
      } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${account}/collections`, {
        withCredentials: true,
      });

      if (myCollectionsData) {
        setMyCollections(myCollectionsData);
      }
    } catch (e) {
      console.log(e.response);
    }
  };

  useEffect(() => {
    getMyCollections();
  }, [account]);

  return (
    <Container>
      <Text
        claaName="title"
        style={{ fontSize: "35px !important", fontWeight: "bold", marginBottom: "30px" }}
        align="center"
      >
        Create New Item
      </Text>
      <UploadFile imageURI={imageURI} setImageURI={setImageURI} />
      <TitleInput>
        <Text>Name</Text>
        <Input
          value={name}
          onChange={(e) => {
            if (e.nativeEvent.data && isHangul(e.nativeEvent.data)) {
              alert("영문으로 입력해주세요.");
            }
            setName(e.currentTarget.value);
          }}
          onInput={hangulToAlphabet}
          variant="default"
          placeholder="Name"
        />
      </TitleInput>
      <TitleInput>
        <Text>Description</Text>
        <Input
          value={description}
          onChange={(e) => {
            if (e.nativeEvent.data && isHangul(e.nativeEvent.data)) {
              alert("영문으로 입력해주세요.");
            }
            setDescription(e.currentTarget.value);
          }}
          onInput={hangulToAlphabet}
          variant="default"
          placeholder="Description"
        />
      </TitleInput>
      <TitleInput>
        <Text>Collection</Text>
        <Select
          placeholder="Pick one"
          data={myCollections.map((myCollection) => ({
            value: myCollection.symbol,
            label: myCollection?.name,
          }))}
          value={symbol}
          onChange={async (value) => {
            setSymbol(value);
            const {
              data: { data: collectionData },
            } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections/${value}`, {
              withCredentials: true,
            });
            console.log(collectionData);
            if (collectionData) {
              setContractAddress(collectionData.contractAddress);
            }
          }}
        />
      </TitleInput>

      <div style={{ width: "180px", margin: "0 auto" }}>
        <Button
          onClick={() =>
            handleCreate({
              ownerAddress: account,
              contractAddress,
              name,
              description,
              imageURI,
            })
          }
          variant="light"
          color="teal"
          fullWidth
        >
          Create
        </Button>
      </div>
    </Container>
  );
};

export default MintNFT;

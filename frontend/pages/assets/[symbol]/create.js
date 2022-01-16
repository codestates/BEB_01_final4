import { Button, Input, Text } from "@mantine/core";
import styled from "styled-components";
import UploadFile from "../../../components/uploadFile";
import { useRouter } from "next/router";
import { useStore } from "../../../utils/store";
import { useInputState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import axios from "axios";
import { GGanbuCollection } from "../../../public/compiledContracts/GGanbuCollection";
import { hangulToAlphabet } from "../../create";
import { isHangul } from "../../create-collection";

const Container = styled.div`
  && {
    max-width: 600px;
    margin: 30px auto;
  }
`;

const TitleInput = styled.div`
  margin: 20px 0;

  .mantine-Text-root {
    margin-bottom: 10px;
  }
`;

const CText = styled(Text)`
  background-color: #f1f3f5;
  color: #909296;
  opacity: 0.6;
  cursor: not-allowed;
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 0 12px;
  line-height: 34px;
`;

const MintNFT = () => {
  const router = useRouter();
  const { symbol } = router.query;
  const [name, setName] = useInputState("");
  const [description, setDescription] = useInputState("");
  const [imageURI, setImageURI] = useState("");
  const account = useStore((state) => state.account);
  const web3 = useStore((state) => state.web3);
  const [collection, setCollection] = useState(null);

  const getCollection = async () => {
    try {
      if (symbol) {
        const {
          data: { data: collectionData },
        } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections/${symbol}`);
        console.log(collectionData);
        setCollection(collectionData);
      }
    } catch (e) {
      console.dir(e);
    }
  };

  useEffect(() => {
    getCollection();
  }, []);

  const handleCreate = async ({ ownerAddress, contractAddress, name, description, imageURI }) => {
    // console.log(collection);

    const newNFT = {
      ownerAddress,
      contractAddress,
      name,
      description,
      traits: JSON.stringify([]),
      imageURI,
    };

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
        const contract = await new web3.eth.Contract(GGanbuCollection.abi, collection.contractAddress, {
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

  return (
    <Container>
      <Text style={{ fontSize: "35px", fontWeight: "bold", marginBottom: "30px" }} align="center">
        Create New Item
      </Text>
      <UploadFile imageURI={imageURI} setImageURI={setImageURI} />
      <TitleInput>
        <Text>이름</Text>
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
          placeholder="이름"
        />
      </TitleInput>
      <TitleInput>
        <Text>설명</Text>
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
          placeholder="설명"
        />
      </TitleInput>
      <TitleInput>
        <Text>Collection</Text>
        <CText>{collection?.name}</CText>
        {/* <Input disabled variant="default" placeholder="Collection" value={collection?.name} /> */}
      </TitleInput>

      <div style={{ width: "180px", margin: "0 auto" }}>
        <Button
          onClick={() =>
            handleCreate({
              ownerAddress: account,
              contractAddress: collection.contractAddress,
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

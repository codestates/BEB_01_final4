import { useState } from "react";
import { Button, Input, LoadingOverlay, Text } from "@mantine/core";
import styled from "styled-components";
import { useInputState } from "@mantine/hooks";
import { GGanbuCollection } from "../public/compiledContracts/GGanbuCollection";
import { useStore } from "../utils/store";
import UploadLogo from "../components/uploadLogo";
import UploadBanner from "../components/uploadBanner";

const Container = styled.div`
  && {
    max-width: 600px;
    margin: 30px auto;
  }
`;

const TitleInput = styled.div`
  margin: 60px 0;
  && .mantine-Text-root {
    font-size: 18px;
    margin-bottom: 15px;
  }
`;

const CreateCollection = () => {
  const [name, setName] = useInputState("");
  const [symbol, setSymbol] = useInputState("");
  const [description, setDescription] = useInputState("");
  const [web3, account] = useStore((state) => [state.web3, state.account]);
  const [visible, setVisible] = useState(false);
  const [collections, setCollections] = useStore((state) => [state.collections, state.setCollections]);
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const handleCreateCollection = async (name, symbol, description) => {
    if (!account) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    try {
      setVisible(true);
      const contract = await new web3.eth.Contract(GGanbuCollection.abi)
        .deploy({
          data: GGanbuCollection.bytecode,
          arguments: [name, symbol, name], // Writing you arguments in the array
        })
        .send({ from: account });

      if (contract) {
        console.log(contract._address);
        const newCollection = {
          contractAddress: contract._address,
          ownerAddress: account,
          name,
          symbol,
          description,
          large_image_url: logoUrl,
          banner_image_url: bannerUrl,
          assets: [],
        };
        console.log(newCollection);
        setCollections([...collections, newCollection]);
      }
    } catch (e) {
      console.dir(e);
    } finally {
      setVisible(false);
    }
  };

  return (
    <>
      <Container>
        <Text style={{ fontSize: "35px", fontWeight: "bold", marginBottom: "30px" }} align="center">
          Create Collection
        </Text>
        <TitleInput style={{ width: "200px" }}>
          <Text>로고 이미지</Text>
          <UploadLogo logoUrl={logoUrl} setLogoUrl={setLogoUrl} />
        </TitleInput>
        <TitleInput>
          <Text>배너 이미지</Text>
          <UploadBanner bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} />
        </TitleInput>
        <TitleInput>
          <Text>이름</Text>
          <Input value={name} onChange={setName} variant="default" placeholder="이름" />
        </TitleInput>
        <TitleInput>
          <Text>심볼</Text>
          <Input value={symbol} onChange={setSymbol} variant="default" placeholder="심볼" />
        </TitleInput>
        <TitleInput>
          <Text>설명</Text>
          <Input value={description} onChange={setDescription} variant="default" placeholder="설명" />
        </TitleInput>

        <div style={{ width: "180px", margin: "0 auto" }}>
          <Button
            onClick={async () => {
              await handleCreateCollection(name, symbol, description);
            }}
            variant="light"
            color="teal"
            fullWidth
          >
            Create
          </Button>
        </div>
      </Container>
      <LoadingOverlay
        style={{ height: "1369px" }}
        visible={visible}
        loaderProps={{ size: "xl", color: "teal", variant: "dots" }}
      />
    </>
  );
};

export default CreateCollection;

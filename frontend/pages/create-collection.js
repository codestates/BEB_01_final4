import { useState } from "react";
import { Button, Input, LoadingOverlay, Text } from "@mantine/core";
import styled from "styled-components";
import { useInputState } from "@mantine/hooks";
import { GGanbuCollection } from "../public/compiledContracts/GGanbuCollection";
import { GGanbuCollectionForKlaytn } from "../public/compiledContracts/GGanbuCollectionForKlaytn";
import { useStore } from "../utils/store";
import UploadLogo from "../components/uploadLogo";
import UploadBanner from "../components/uploadBanner";
import { useRouter } from "next/router";
import axios from "axios";

const Container = styled.div`
  && {
    max-width: 600px;
    margin: 30px auto;
  }
  && .mantine-Text-root {
    font-size: 24px !important;
  }

  && .small-description {
    font-size: 13px !important;
  }

  && .title {
    font-size: 35px !important;
  }

  && input {
    font-size: 18px;
  }
`;

const TitleInput = styled.div`
  margin: 60px 0;
  && .mantine-Text-root {
    font-size: 18px;
    margin-bottom: 15px;
  }
`;

export const isHangul = (value) => {
  const regExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
  return regExp.test(value);
};

export const toInputAlphabetDecimal = (e) => {
  e.target.value = ("" + e.target.value).replace(/[^A-Za-z0-9\\-\s]/gi, "");
};

export const toInputLowerCaseDecimal = async (e) => {
  e.target.value = ("" + e.target.value).replace(/[^a-z0-9\\-]/gi, "").toLowerCase();
};

const CreateCollection = () => {
  const router = useRouter();
  const [name, setName] = useInputState("");
  const [symbol, setSymbol] = useInputState("");
  const [description, setDescription] = useInputState("");
  const [web3, account] = useStore((state) => [state.web3, state.account]);
  const [visible, setVisible] = useState(false);
  const [myCollections, setMyCollections] = useStore((state) => [state.myCollections, state.setMyCollections]);
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [caver, networkId] = useStore((state) => [state.caver, state.networkId]);

  const handleCreateCollection = async ({ name, symbol, description, logoUrl, bannerUrl }) => {
    if (!account) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    if (!name || !symbol || !description || !logoUrl || !bannerUrl) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    try {
      setVisible(true);
      const newCollection = {
        ownerAddress: account,
        name,
        symbol,
        description,
        image_url: logoUrl,
        banner_url: bannerUrl,
      };

      const {
        data: {
          data: { collectionURI },
        },
      } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/collections`, newCollection, {
        withCredentials: true,
      });

      if (collectionURI) {
        let contract;
        console.log(networkId);
        if (networkId === 1001 || networkId === 8217) {
          // klaytn 로직
          console.log(caver);
          contract = await new caver.klay.Contract(GGanbuCollectionForKlaytn.abi)
            .deploy({
              data: GGanbuCollectionForKlaytn.bytecode,
              arguments: [name, symbol, collectionURI], // Writing you arguments in the array
            })
            .send({ from: account, gas: 9000000 });

          console.log(contract);
        } else {
          // ethereum 로직
          contract = await new web3.eth.Contract(GGanbuCollection.abi)
            .deploy({
              data: GGanbuCollection.bytecode,
              arguments: [name, symbol, collectionURI], // Writing you arguments in the array
            })
            .send({ from: account });

          console.log(contract._address);
        }
        if (contract._address) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/collections/${symbol}`,
            { contractAddress: contract._address },
            { withCredentials: true },
          );

          setMyCollections([...myCollections, { ...newCollection, contractAddress: contract._address, assets: [] }]);
          router.push(`/collections/${symbol}`);
        }
      }
    } catch (e) {
      console.log(e);
      if (e.response?.data?.message !== undefined) {
        alert(e.response?.data?.message);
      }
    } finally {
      setVisible(false);
    }
  };

  return (
    <>
      <Container>
        <Text className="title" style={{ fontWeight: "bold", marginBottom: "30px" }} align="center">
          Create Collection
        </Text>
        <TitleInput style={{ width: "200px" }}>
          <Text>Logo Image</Text>
          <UploadLogo logoUrl={logoUrl} setLogoUrl={setLogoUrl} />
        </TitleInput>
        <TitleInput>
          <Text>Banner Image</Text>
          <UploadBanner bannerUrl={bannerUrl} setBannerUrl={setBannerUrl} />
        </TitleInput>
        <TitleInput>
          <Text style={{ marginBottom: "0px" }}>Name</Text>
          <Text className="small-description" style={{ color: "rgb(112, 122, 131)" }}>
            영문, 숫자, - 기호, 띄어쓰기만 가능합니다.
          </Text>
          <Input
            value={name}
            onChange={(e) => {
              if (e.nativeEvent.data && isHangul(e.nativeEvent.data)) {
                alert("영문으로 입력해주세요.");
              }
              setName(e.currentTarget.value);
            }}
            onInput={toInputAlphabetDecimal}
            variant="default"
            placeholder="Name"
          />
        </TitleInput>
        <TitleInput>
          <Text style={{ marginBottom: "0px" }}>Symbol</Text>
          <Text className="small-description" style={{ color: "rgb(112, 122, 131)" }}>
            영문 소문자, 숫자, - 기호만 입력 가능합니다.
          </Text>
          <Input
            value={symbol}
            onChange={(e) => {
              if (e.nativeEvent.data && isHangul(e.nativeEvent.data)) {
                alert("영문 소문자으로 입력해주세요.");
              }
              setSymbol(e.currentTarget.value);
            }}
            onInput={toInputLowerCaseDecimal}
            variant="default"
            placeholder="Symbol"
          />
        </TitleInput>
        <TitleInput>
          <Text>Description</Text>
          <Input value={description} onChange={setDescription} variant="default" placeholder="Description" />
        </TitleInput>

        <div style={{ width: "180px", margin: "0 auto" }}>
          <Button
            onClick={async () => {
              await handleCreateCollection({ name, symbol, description, logoUrl, bannerUrl });
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

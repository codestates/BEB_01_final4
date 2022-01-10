import { Button, Input, Text } from "@mantine/core";
import styled from "styled-components";
import UploadFile from "../../../components/uploadFile";
import { useRouter } from "next/router";
import { useStore } from "../../../utils/store";

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

const MintNFT = () => {
  const router = useRouter();
  const { tokenCA } = router.query;
  const collections = useStore((state) => state.collections);
  const collection = collections.find((collection, idx) => {
    if (collection.contractAddress === tokenCA) return true;
  });

  console.log(collection);

  return (
    <Container>
      <Text style={{ fontSize: "35px", fontWeight: "bold", marginBottom: "30px" }} align="center">
        Create New Item
      </Text>
      <UploadFile />
      <TitleInput>
        <Text>이름</Text>
        <Input variant="default" placeholder="이름" />
      </TitleInput>
      <TitleInput>
        <Text>설명</Text>
        <Input variant="default" placeholder="설명" />
      </TitleInput>
      <TitleInput>
        <Text>Collection</Text>
        <Input variant="default" placeholder="Collection" value={collection?.name} onChange={() => {}} />
      </TitleInput>

      <div style={{ width: "180px", margin: "0 auto" }}>
        <Button variant="light" color="teal" fullWidth>
          Create
        </Button>
      </div>
    </Container>
  );
};

export default MintNFT;

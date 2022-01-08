import { Button, Input, Text } from "@mantine/core";
import styled from "styled-components";
import { useInputState } from "@mantine/hooks";

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

const CreateCollection = () => {
  const [name, setName] = useInputState("");
  const [symbol, setSymbol] = useInputState("");
  const [description, setDescription] = useInputState("");

  return (
    <Container>
      <Text style={{ fontSize: "35px", fontWeight: "bold", marginBottom: "30px" }} align="center">
        Create Collection
      </Text>
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
          onClick={() => {
            console.log(name, symbol, description);
          }}
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

export default CreateCollection;

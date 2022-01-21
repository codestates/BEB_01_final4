import { Text } from "@mantine/core";
import styled from "styled-components";

export const Container = styled.div`
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

export const TitleInput = styled.div`
  margin: 20px 0;

  .mantine-Text-root {
    margin-bottom: 10px;
  }
`;

export const CText = styled(Text)`
  background-color: #f1f3f5;
  color: #909296;
  opacity: 0.6;
  cursor: not-allowed;
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 0 12px;
  line-height: 34px;
`;

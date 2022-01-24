import { Text } from "@mantine/core";
import { useState } from "react";

const GGanbu = () => {
  const [gganbuList, setGGanbuList] = useState([]);

  return (
    <div>
      <Text align="center" style={{ fontSize: "32px" }}>
        깐부 모집 중
      </Text>
    </div>
  );
};

export default GGanbu;

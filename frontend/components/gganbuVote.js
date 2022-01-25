import { Badge, Button, Table } from "@mantine/core";
import Image from "next/image";
import styled from "styled-components";

const CTable = styled(Table)`
  && td {
    font-size: 20px;
  }

  && th {
    font-size: 18px;
  }
`;

const GGanbuVote = ({ suggestions }) => {
  const rows = suggestions.map((suggestion, idx) => (
    <tr key={idx}>
      <td>{suggestion.gganbu.asset.name}</td>
      <td>
        <Image src={suggestion.gganbu.asset.imageURI} width={128} height={128} alt="" />
      </td>
      <td>
        <div style={{ display: "flex" }}>
          <Image src="/images/eth.svg" width={12} height={12} alt="" />
          <span style={{ marginLeft: "5px" }}>{suggestion.gganbu.asset.price}</span>
        </div>
      </td>
      <td>
        <div style={{ display: "flex" }}>
          <Image src="/images/eth.svg" width={12} height={12} alt="" />
          <span style={{ marginLeft: "5px" }}>{suggestion.gganbu.asset.recruiting.balance}</span>
        </div>
      </td>
      <td>{suggestion.gganbu.asset.description}</td>
      <td>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div>{suggestion.type === "join" && <Badge>참여자 승인 건</Badge>}</div>
          <div style={{ marginTop: "15px" }}>
            <Button>투표하기</Button>
          </div>
        </div>
      </td>
    </tr>
  ));

  return (
    <CTable>
      <thead>
        <tr>
          <th>name</th>
          <th>item</th>
          <th>판매금액</th>
          <th>모금액</th>
          <th>설명</th>
          <th style={{ textAlign: "center" }}>안건</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </CTable>
  );
};

export default GGanbuVote;

import { Button, Image, Table } from "@mantine/core";
import styled from "styled-components";

const CTable = styled(Table)`
  && td {
    font-size: 20px;
  }

  && th {
    font-size: 18px;
  }
`;

const CImage = styled(Image)`
  && img {
    object-fit: fill !important;
  }
`;

const MyDaoTable = ({ myDaos }) => {
  // name, description, balance, num_of_members, members[]

  const rows = myDaos.map((dao, idx) => (
    <tr key={idx}>
      <td>{dao.name}</td>
      <td>{dao.description}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CImage src="/images/eth.svg" width={16} height={16} alt="" />
          <span style={{ marginLeft: "5px" }}>{dao.balance}</span>
        </div>
      </td>
      <td style={{ textAlign: "center" }}>{dao.num_of_members}</td>
      <td style={{ textAlign: "center" }}>
        <Button>가입자 목록</Button>
      </td>
    </tr>
  ));

  return (
    <CTable>
      <thead>
        <tr>
          <th>이름</th>
          <th>설명</th>
          <th style={{ textAlign: "center" }}>모금액</th>
          <th style={{ textAlign: "center" }}>가입자 수</th>
          <th style={{ textAlign: "center" }}>가입자 목록</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </CTable>
  );
};

export default MyDaoTable;

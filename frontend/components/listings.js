import { Table } from "@mantine/core";
import Image from "next/image";
import styled from "styled-components";
import { useStore } from "../utils/store";

const CTable = styled(Table)`
  && tr th {
    font-size: 18px !important;
  }

  && tr td {
    font-size: 16px;
  }
`;

const Listings = ({ elements }) => {
  const networkId = useStore((state) => state.networkId);
  const rows = elements.map((element, idx) => (
    <tr key={idx}>
      <td style={{ display: "flex", alignItems: "center" }}>
        <Image src="/images/klay-logo.svg" width={20} height={20} alt="" />
        <span style={{ marginLeft: "5px" }}>{element.price}</span>
      </td>
      <td>{element.seller}</td>
      <td>{`${new Date(element.updatedAt).toLocaleString("en-US")}`}</td>
    </tr>
  ));

  return (
    <CTable style={{ marginTop: "15px" }}>
      <thead>
        <tr>
          <th>Price</th>
          <th>From</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </CTable>
  );
};

export default Listings;

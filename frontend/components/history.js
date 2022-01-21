import { Table } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";

const CTr = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }

  && th,
  && td {
    font-size: 18px;
  }
`;

const History = ({ elements }) => {
  const router = useRouter();

  const handleClick = (element) => {
    router.push(`/assets/${element.collection.symbol}/${element.token_ids}`);
  };

  const rows = elements.map((element, idx) => (
    <CTr style={{ cursor: "pointer" }} onClick={() => handleClick(element)} key={idx}>
      <td>{element.asset.name}</td>
      <td style={{ display: "flex", alignItems: "center" }}>
        {/* <div
          style={{
            width: "16px",
            height: "16px",
            backgroundImage: "url(/images/eth.svg",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        /> */}
        <Image src="/images/eth.svg" width={16} height={16} alt="" />
        {element.price}
      </td>
      <td>{element.seller}</td>
      <td>{element.buyer}</td>
      <td>{`${new Date(element.updatedAt).toLocaleString("en-US")}`}</td>
    </CTr>
  ));

  return (
    <Table style={{ marginTop: "15px" }}>
      <thead>
        <tr>
          <th style={{ fontSize: "18px" }}>Item</th>
          <th style={{ fontSize: "18px" }}>Price</th>
          <th style={{ fontSize: "18px" }}>From</th>
          <th style={{ fontSize: "18px" }}>To</th>
          <th style={{ fontSize: "18px" }}>Time</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default History;

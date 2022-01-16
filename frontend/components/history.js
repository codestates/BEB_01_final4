import { Table } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";

const CTr = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
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
      <td>{element.updatedAt}</td>
    </CTr>
  ));

  return (
    <Table style={{ marginTop: "15px" }}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>From</th>
          <th>To</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default History;

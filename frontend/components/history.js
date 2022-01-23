import { Table } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useStore } from "../utils/store";

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
  const account = useStore((state) => state.account);

  const handleClick = (element) => {
    router.push(`/assets/${element.collection.symbol}/${element.token_ids}`);
  };

  const rows = elements.map((element, idx) => (
    <CTr style={{ cursor: "pointer" }} onClick={() => handleClick(element)} key={idx}>
      <td>{element.asset.name}</td>
      <td><Image src={element.asset.imageURI} width={128} height={128} alt="" /></td>
      {/* <td style={{ display: "flex", alignItems: "center" }}> */}
      <td>
        {/* <div
          style={{
            width: "16px",
            height: "16px",
            backgroundImage: "url(/images/eth.svg",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        /> */}
        <Image src="/images/eth.svg" width={16} height={16} alt="" />&nbsp;
        {element.price}
      </td>
      <td>{(account == element.seller) ? '나' : element.seller.substring(2,8)}</td>
      <td>{(account == element.buyer) ? '나' : element.buyer.substring(2,8)}</td>
      <td>{`${new Date(element.updatedAt).toLocaleString("en-GB")}`}</td>
    </CTr>
  ));

  return (
    <Table style={{ marginTop: "15px" }}>
      <thead>
        <tr>
          <th style={{ fontSize: "18px" }}>Name</th>
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

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

const RentHistory = ({ elements }) => {
  const router = useRouter();
  const account = useStore((state) => state.account);
  const networkId = useStore((state) => state.networkId);

  const handleClick = (element) => {
    router.push(`/assets/${element.collection.symbol}/${element.token_ids}`);
  };

  const rows = elements.map((element, idx) => (
    <CTr style={{ cursor: "pointer" }} onClick={() => handleClick(element)} key={idx}>
      <td>{element.asset.name}</td>
      <td>
        <Image src={element?.asset?.imageURI ? element?.asset?.imageURI : ""} width={128} height={128} alt="" />
      </td>
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
        <Image
          src={`${networkId === 1001 || networkId === 8217 ? "/images/klay.svg" : "/images/eth.svg"}`}
          width={16}
          height={16}
          alt=""
        />
        &nbsp;
        {element.price}
      </td>
      <td>{account == element.owner ? "나" : element.owner.substring(2, 8)}</td>
      <td>{account == element.renter ? "나" : element.renter.substring(2, 8)}</td>
      <td>{`${new Date(element.createdAt).toLocaleString("en-GB")}`}</td>
      <td>{`${new Date(element.updatedAt).toLocaleString("en-GB")}`}</td>
    </CTr>
  ));

  return (
    <Table style={{ marginTop: "15px" }}>
      <thead>
        <tr>
          <th style={{ fontSize: "18px" }}>Name</th>
          <th style={{ fontSize: "18px" }}>Item</th>
          <th style={{ fontSize: "18px" }}>요금</th>
          <th style={{ fontSize: "18px" }}>Owner</th>
          <th style={{ fontSize: "18px" }}>Renter</th>
          <th style={{ fontSize: "18px" }}>시작일</th>
          <th style={{ fontSize: "18px" }}>종료일</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default RentHistory;

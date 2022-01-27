import { Table } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import styled from "styled-components";

const CTable = styled(Table)`
  && td {
    font-size: 20px;
  }

  && th {
    font-size: 18px;
  }
`;

const handleClick = async () => {
  router.push(`/assets/${symbol}/${token_ids}`);
};

const GGanbuBoard = ({ gganbuList }) => {
  const router = useRouter();

  const rows = gganbuList.map((gganbu, idx) => {
    if (Object.keys(gganbu).length === 0) {
      return null;
    }
    return (
      <tr
        style={{ cursor: "pointer" }}
        onClick={() => {
          router.push(`/assets/${gganbu.asset.collection.symbol}/${gganbu.asset.token_ids}`);
        }}
        key={idx}
      >
        <td>{gganbu?.asset?.name}</td>
        <td>{gganbu?.asset?.imageURI && <Image src={gganbu?.asset?.imageURI} width={128} height={128} alt="" />}</td>
        <td style={{ textAlign: "center" }}>{gganbu?.num_of_members}</td>
        <td>
          <div style={{ display: "flex" }}>
            <Image src="/images/eth.svg" width={12} height={12} alt="" />
            <span style={{ marginLeft: "5px" }}>{gganbu?.asset?.price}</span>
          </div>
        </td>
        <td>
          <div style={{ display: "flex" }}>
            <Image src="/images/eth.svg" width={12} height={12} alt="" />
            <span style={{ marginLeft: "5px" }}>
              {Math.round(parseFloat(gganbu?.members?.reduce((acc, cur) => acc + cur.staking_value, 0)) * 100) / 100}
            </span>
          </div>
        </td>
        <td style={{ textAlign: "center" }}>{gganbu?.ratio_of_staking}%</td>
        <td>{gganbu?.description}</td>
      </tr>
    );
  });

  return (
    <CTable highlightOnHover>
      <thead>
        <tr>
          <th>name</th>
          <th>item</th>
          <th style={{ textAlign: "center" }}>가입자 수</th>
          <th>판매금액</th>
          <th>모금액</th>
          <th style={{ textAlign: "center" }}>모금 비율</th>
          <th>설명</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </CTable>
  );
};

export default GGanbuBoard;

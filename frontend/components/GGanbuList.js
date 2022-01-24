import { Table } from "@mantine/core";
import Image from "next/image";
import Jazzicon from "react-jazzicon/lib/Jazzicon";

function GGanbuList({ elements }) {
  const rows = elements.map((element, idx) => (
    <tr key={idx}>
      <td>
        <Jazzicon diameter={50} seed={Math.round(Math.random() * 10000000)} />
      </td>
      <td style={{ fontSize: "16px" }}>{element?.memberAddress}</td>
      <td>
        <div style={{ display: "flex" }}>
          <Image src="/images/eth.svg" width={9} height={9} alt="" />
          <span style={{ marginLeft: "6px", fontSize: "16px" }}>{element?.staking_value}</span>
        </div>
      </td>
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr>
          <th></th>
          <th>Address</th>
          <th>지분</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}

export default GGanbuList;

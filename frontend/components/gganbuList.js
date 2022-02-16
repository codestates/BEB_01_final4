import { Table } from "@mantine/core";
import Image from "next/image";
import Jazzicon from "react-jazzicon/lib/Jazzicon";
import { useStore } from "../utils/store";

function GGanbuList({ elements }) {
  const networkId = useStore((state) => state.networkId);
  const rows = elements.map((element, idx) => (
    <tr key={idx}>
      <td>
        <Jazzicon diameter={50} seed={Math.round(Math.random() * 10000000)} />
      </td>
      <td style={{ fontSize: "16px" }}>{element?.memberAddress}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src={`${networkId === 1001 || networkId === 8217 ? "/images/klay.svg" : "/images/eth.svg"}`}
            width={30}
            height={30}
            alt=""
          />
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

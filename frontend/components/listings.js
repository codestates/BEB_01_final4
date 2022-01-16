import { Table } from "@mantine/core";
import Image from "next/image";

const Listings = ({ elements }) => {
  const rows = elements.map((element, idx) => (
    <tr key={idx}>
      <td style={{ display: "flex", alignItems: "center" }}>
        <Image src="/images/eth.svg" width={16} height={16} alt="" />
        {element.price}
      </td>
      <td>{element.seller}</td>
      <td>{element.updatedAt}</td>
    </tr>
  ));

  return (
    <Table style={{ marginTop: "15px" }}>
      <thead>
        <tr>
          <th>Price</th>
          <th>From</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default Listings;

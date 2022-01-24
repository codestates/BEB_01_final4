import { Table } from "@mantine/core";

const GGanbuBoard = ({ gganbuList }) => {
  const rows = gganbuList.map((gganbu) => (
    <tr key={gganbu.name}>
      <td>{gganbu.position}</td>
      <td>{gganbu.name}</td>
      <td>{gganbu.symbol}</td>
      <td>{gganbu.mass}</td>
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr>
          <th>name</th>
          <th>item</th>
          <th>판매금액</th>
          <th>모금액</th>
          <th>설명</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default GGanbuBoard;

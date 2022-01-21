import { Table } from "@mantine/core";

function Traits({ elements }) {
  let rows;
  console.log(elements);
  if (elements && elements.length > 0) {
    rows = elements.map((element, idx) => (
      <tr key={idx}>
        <td>{element.trait_type}</td>
        <td>{element.value}</td>
      </tr>
    ));
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}

export default Traits;

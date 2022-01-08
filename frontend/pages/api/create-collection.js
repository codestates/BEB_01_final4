import fs from "fs";

export default function handler(req, res) {
  if (req.method === "POST") {
    // Process a POST request
    const contract = JSON.parse(fs.readFileSync("./compiledContracts/GGanbuCollection.json", "utf8"));
    console.log(JSON.stringify(contract.abi));
    res.json({ message: contract.abi });
  } else {
    // Handle any other HTTP method
  }
}

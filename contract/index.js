import Web3 from "web3";
import abi from "./abi.js";

const contractAddr = "0x16707120e81A9DB475dB4326596aBfF81B96D82F";//ropsten
const account = "지갑주소";
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545/%22));
const ropsten = 'https://ropsten.infura.io/v3/7e62d3d0edb8465499fa21ad70873a3f';
const web3 = new Web3(ropsten);
const privateKey = "개인키";
const contract = new web3.eth.Contract(abi, contractAddr, { from: account });
const mint = async () => {
    try {
        const mintMethod = await contract.methods.mintNFT("test nft uri");
        const encodedAbi = mintMethod.encodeABI();
        const tx = {
            from: account,
            to: contractAddr,
            gas: 200000,
            data: encodedAbi
        };
        const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
        const tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

        tran.on('transactionHash', hash => {
            console.log('hash');
            console.log(hash);
        });

        tran.on('receipt', receipt => {
            console.log('reciept');
            console.log(receipt);
        });

        tran.on('error', console.error);

    } catch (error) {
        console.log(error);
    }
    //console.log(await contract.methods);


}

const _sell = async (tokenId, price) => {
    try {
        const receipt = await contract.methods.sell(tokenId, price).send({ from: account, gas: 200000 });
        console.log(receipt);
    } catch (error) {
        console.log(error);
    }

}

const total = async () => {
    console.log(await contract.methods.totalSupply().call());
}

//mint();
//_sell(1, 1);

total();
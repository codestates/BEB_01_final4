import Web3 from "web3";
import abi from "./abi.js";

//const contractAddr = "0x2Fe4fC57e21a74928641B03FB1411B1fc1D4F97F";//ropsten
//const account = "0x459F501012aD38d0cC52C0fd0669B1F7764f3814";
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545/%22));
const ropsten = '';//infura에서 제공하는 연결 url
const web3 = new Web3(ropsten);
const privateKey = "";
const contract = new web3.eth.Contract(abi, contractAddr, { from: account });
//const tradeAddr = "0x7B9Aeca6e0D327312DfEf102bea7b70d960359De";
const mint = async () => {
    //nft mint
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
    //거래 등록
    try {
        const mintMethod = await contract.methods.sell(tokenId, web3.utils.toWei(String(price),"ether"));
        const encodedAbi = mintMethod.encodeABI();
        const tx = {
            from: account,
            to: contractAddr,
            gas: 5000000,
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

}

const total = async () => {
    //최신 tokenId 가져옴
    console.log(await contract.methods.totalSupply().call());
}

const tradeAddress = async (tokenId) => {
    //거래중인 tokenId의 trade contract address 가져옴
    console.log(await contract.methods.getApproved(tokenId).call());
}

const _cancel= async (tokenId, addr) => {
    //거래취소
    try {
        const mintMethod = await contract.methods.cancel(tokenId, addr);
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

}

//mint();
_sell(1, 0.01);
//tradeAddress(1);
//_cancel(1,tradeAddr);
//total();
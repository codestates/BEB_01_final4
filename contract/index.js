import Web3 from "web3";
//import abi from "./abi.js";
//import byteCode from "./bytecode.js";
const contractAddr = "0x5dA39Bd3cf655F96F48E02b0C29018D61C09F390";//ropsten
const account = "0x459F501012aD38d0cC52C0fd0669B1F7764f3814";
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
const ropsten = `https://ropsten.infura.io/v3/7e62d3d0edb8465499fa21ad70873a3f`;
const web3 = new Web3(ropsten);
const privateKey = "05dd38f9da2e154155095c993ed63acfaa3955f1e6419e1f09bb8b68321aecf2";
const abi = [
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "val",
				"type": "uint256"
			}
		],
		"name": "test",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "token",
				"type": "uint256"
			}
		],
		"name": "trading",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
];

const contract = new web3.eth.Contract(abi, contractAddr, { from: account });
/**
 //collection 생성할 때 마다 새로운 collection 배포하는 코드

    var collectionName = ""  ;
    var collectionSymbol ="" ;
    var _collectionURI = ""  ;
    var gganbucollectionContract = new web3.eth.Contract(abi);
    var gganbucollection = gganbucollectionContract.deploy({
     data: `0x${byteCode.object}`,
      arguments: [
          collectionName,
          collectionSymbol,     
          _collectionURI,
     ]
}).send({
     from: web3.eth.accounts[0], 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })

 주의!! .send이후 contract.address 값이 collection 주소랑 다를 수 있다. => 이런경우 보통 contract.to가 collection 주소
 */
const mint = async () => {
    try {
        const mintMethod = await contract.methods.trading(2);
        const encodedAbi = mintMethod.encodeABI();
        const tx = {
            from: account,
            to: contractAddr,
            gas: 200000,
            data: encodedAbi,
            value:web3.utils.toWei("1", "ether")
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
        const mintMethod = await contract.methods.sell(tokenId, web3.utils.toWei(String(price), "ether"));
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
    console.log(await contract.methods.totalSupply().call());
}

const isSell = async (tokenId) => {
    console.log(await contract.methods.getIsSelling(tokenId).call());
}
const getOwnerOfNft = async (tokenId) => {
    console.log(await contract.methods.ownerOf(tokenId).call());
}
const getTradeContract = async (tokenId) => {
    console.log(await contract.methods.getApproved(tokenId).call());
}

const cancelSale = async (tokenId, tradecontract) => {
    try {
        const mintMethod = await contract.methods.cancel(tokenId, tradecontract);
        const encodedAbi = mintMethod.encodeABI();
        const tx = {
            from: account,
            to: contractAddr,
            gas: 2000000,
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
mint();
//_sell(1, 0.01);
//isSell(1);
//getOwnerOfNft(1);
//cancelSale(1, tradeContract);
//total();
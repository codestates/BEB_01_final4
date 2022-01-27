const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { Transactions, Collections, NFTs, Trades, sequelize } = require(".././models");
const fs = require('fs');
const path = require("path");
const basePath = __dirname;

/*============ 수동으로 입력해야 할 정보 =================*/
//NFT 보유자 지갑 정보
//사용자1(account6) const ownerAddress = '0x7C103842366E592158569cFb732AD6c373714523';
//사용자1(account6) const privateKey = 'e317944870dd3ce63ad08aac9f673d192e15782227c97a79e7121e31cba7108e';
//사용자2(account7)
const ownerAddress = '0x3bc40DAD005c1E13199Af558656Fa06023c37af7';
const privateKey = 'e532ab08fcccb7a5d4dfe60f5293eac3798eacbc6b674180701574a7be54b6a7';

//NFT 의 컬랙션 정보
//aether
const ca = '0x2b490d11346D18Ac4dADA349aB34c5E3B334533C';

//tran
const tran = '0xabe20714e1be9b4383e22c526ccd2846e01d16f552907866c7d7b0f44b4cb13d';

//NFT 토큰 정보
const iToken_ids = 6;

//가격
const iPrice = 300;

/*==========================================================*/
const abi = require("./MyERC721_ABI");
const bytecode = require("./MyERC721_Bytecode");
const coffer_abi = require("./CofferERC721_ABI");
const coffer_bytecode = require("./CofferERC721_Bytecode");
const serverPath = 'http://localhost:4000';

const abiDecoder = require('abi-decoder'); // NodeJS
abiDecoder.addABI(abi);
abiDecoder.addABI(coffer_abi);
/*==========================================================*/

test(tran);
async function test(tran) {
  try { 
    let tx = await web3.eth.getTransaction(tran);
    console.log(tx);
    console.log('===============================================');
    let decodedData = abiDecoder.decodeMethod(tx.input);
    console.log(decodedData);
    console.log('===============================================');
    
    //Receipt
    tx = await web3.eth.getTransactionReceipt(tran);
    console.log(tx);
    decodedData = abiDecoder.decodeLogs(tx.logs);
    console.log('===============================================');
    console.log(decodedData);
    console.log('===============================================');
    
    //events
    for(let i=0;i<decodedData.length;i++) {
      console.log(`${decodedData[i].name}`);
      for(let j=0;j<decodedData[i].events.length;j++) {
        console.log(decodedData[i].events[j]);
      }
    }

    console.log('===============================================');
    
    //깐부지갑
    const contractObj = new web3.eth.Contract(
      coffer_abi, tx.to,
    );
    const total = await contractObj.methods.getTotal().call();
    console.log(`참여자수: ${total}`);
    
    //token  거래 상태 및 owner 확인
    // const contractNFT = new web3.eth.Contract(
    //   abi, '0x07103309133Ed782884F5249C316287F1BD21380',
    // );
    // const owner = await contractNFT.methods.ownerOf(8).call();
    // console.log(`NFT 소유자: ${owner}`);
    //const getSuggestionState = await contractObj.methods.getSuggestionState(2).call();
    //console.log(getSuggestionState);
    

    console.log('===============================================');
    const balance = await web3.eth.getBalance(tx.to);
    const iBalance = web3.utils.fromWei(balance, 'ether');
    console.log(iBalance);
    let curBlkNum = await web3.eth.getBlockNumber();
    console.log(curBlkNum);
  } catch(e) {
    console.log(e);
  }
}

//vote
//vote();
async function vote() {
  // 컨트랙트 객체 생성
  const contractObj = new web3.eth.Contract(
    coffer_abi, ca, 
    {
      from: ownerAddress,
      gasPrice: "200000",
    }
  );

  //보낼 트랜잭션 데이터 생성
  const data = contractObj.methods.vote(2, 1).encodeABI();

  //트랜잭션에 server 서명
  signedTx = await web3.eth.accounts.signTransaction(
      {
          to: ca, //받는 사람이 아니라, 계약주소임. 받는 사람은 transfer 함수에 설정
          gas: 6721975,
          data: data,
      }, privateKey);

  //트랜잭션 발송
  rtnTran = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
  console.log(rtnTran);
}
//sell(abi, ca, ownerAddress, privateKey, iToken_ids, iPrice);



//selling 중인 Trades CA 를 모니터링
const checkBuy = async (MyAbi, MyCA, tran_id, tradeCA, MyToken_ids) => {
  /*
  * 가격이 같고, 해당 트레이트ca에 가격이 보내졌다면 buy 가 요청된 것이다
  * 검증: token 거래 상태 확인(false인지), 해당 token owner 가 tx.from 으로 변경됐는지 확인
  * 검증 결과가 pass 되면
  * NFTs(ownerAddress 를 tx.from 으로 업데이트),
  * Trades(status 를 'completed' 로 업데이트)
  * Trades(buyer 를 tx.from 으로 업데이트) 
  */

  try {
    //let tx = await web3.eth.getTransactionReceipt(tran_id);
    let tx = await web3.eth.getTransaction(tran_id);
    console.log(tx);

    if(web3.utils.toChecksumAddress(tx.to) == tradeCA) {
      console.log('찾았다');

      //가격 정보 확인
      tx.input_price = await web3.utils.fromWei(tx.value, "ether");
      console.log(`가격 : ${tx.input_price} eth`);

      //DB의 가격정보와 같은지 확인필요

      //token  거래 상태 및 owner 확인
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );
      const ownerOf = await contractObj.methods.ownerOf(MyToken_ids).call();
      const getIsSelling = await contractObj.methods.getIsSelling(MyToken_ids).call();
      
      if(ownerOf == tx.from) {
        //검증 완료
        console.log('NFT 소유자 변경됨');
      }
      if(getIsSelling == false) {
        //사자마자 다시 판매등록 할수는 있지만, 앱에서는 불가능하다(이 로직이 완료되어야 판매가능하다)
        //검증 완료
        console.log('판매 상태가 false 임');
      }

      //DB업데이트



    } else {
      console.log('트레이드와 관련없는 트랙잭션임');
    }
  }
  catch(e) {
    console.log(`에러 : ${e.message}`);
  }  

}
// checkBuy(abi, ca, 
//   '0x458c6da1155eb8a994bb48e7d1e74741e63b0bc8831a99d6ebddd5068e13a390',
//   trade_ca, 1
// );

//checkNFT & sell info
//collection 알려주면, 포함된 NFT 가 몇개 발행됐는지 확인하고 각 NFT 별로 trade 상태 확인
const checkNFTs = async (MyAbi, MyCA) => {
  try {
    //trade contractAddress 조회
    const contractObj = new web3.eth.Contract(
      MyAbi, MyCA,
    );

    //NFT 몇개 발행됐는지 확인
    const totalSupply = await contractObj.methods.totalSupply().call();
    
    //각 NFT 별로 owner, 판매CA, 판매중 여부 확인
    for(let i=1;i<=Number(totalSupply);i++) {
      //let tokenURI = await tokenContract.methods.tokenURI(i).call();
      
      //토큰 owner
      const ownedOf = await contractObj.methods.ownerOf(i).call();
      //토큰 판매 상태
      const getApproved = await contractObj.methods.getApproved(i).call();
      const getIsSelling = await contractObj.methods.getIsSelling(i).call();
      
      console.log(`=== collection addr : ${MyCA} ===`)
      console.log(`=== token ids : ${i} ===`)
      console.log(`소유자: ${ownedOf}`);
      console.log(`판매CA: ${getApproved}`);
      console.log(`판매상태: ${getIsSelling}`);
      console.log(' ');
    }
  }
  catch(e) {
    console.log(e);
  }
}
//checkNFTs(abi, ca);



const checkDecode = async (tran_id) => {
  //rtnTran = value.logs[1].data;
  //console.log(rtnTran);

  //let rtnTran = await web3.eth.getTransaction(tran_id);
  let rtnTran = await web3.eth.getTransactionReceipt(tran_id);
  
  // for(let i=0;i<rtnTran.logs.length;i++) {
  //   console.log(rtnTran.logs[i].topics);
  //   let test = abiDecoder.decodeMethod(rtnTran.logs[i].topics[0]);
  //   console.log(test);

  //   //console.log(abiDecoder.decodeMethod(rtnTran);
  // }
  
  const decodedData = abiDecoder.decodeMethod(rtnTran.input);

  console.log('--------------------------------')
  console.log(decodedData);
}
//checkDecode('0x458c6da1155eb8a994bb48e7d1e74741e63b0bc8831a99d6ebddd5068e13a390');

//sell
const sell = async (MyAbi, MyCA, pubAddr, privAddr, MyToken_ids, MyPrice) => {
  //블록에 던져줄 정보는 token_ids, price 임
  
  //ERC721 컨트랙트 객체 생성
  const contractObj = new web3.eth.Contract(
    MyAbi, MyCA, 
    {
      from: pubAddr,
      gasPrice: "200000",
    }
  );

  //보낼 트랜잭션 데이터 생성
  const data = contractObj.methods.sell(MyToken_ids, MyPrice).encodeABI();

  //트랜잭션에 server 서명
  signedTx = await web3.eth.accounts.signTransaction(
      {
          to: MyCA, //받는 사람이 아니라, 계약주소임. 받는 사람은 transfer 함수에 설정
          gas: 6721975,
          data: data,
      }, privAddr);

  //트랜잭션 발송
  rtnTran = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
  console.log(rtnTran);
}
//sell(abi, ca, ownerAddress, privateKey, iToken_ids, iPrice);


//isSelling
const isSelling = async (MyAbi, MyCA, MyToken_ids) => {
  //블록에 던져줄 정보는 token_ids, price 임
  
  //ERC721 컨트랙트 객체 생성
  const contractObj = new web3.eth.Contract(
    MyAbi, MyCA, 
  );

  //보낼 call
  const getIsSelling = await contractObj.methods.getIsSelling(MyToken_ids).call();
  const getApproved = await contractObj.methods.getApproved(MyToken_ids).call();
  
  console.log(getIsSelling);
  console.log(getApproved);
}
//isSelling(abi, ca, iToken_ids);




// 파일 데이터를 변수에 적재
const dummy_data = [];
fs.readdirSync('../dummy_data/collections').forEach(file => {
  dummy_data.push(require(`../dummy_data/collections/${file.split('.')[0]}`));
});

const main = async () => {
  //collection 데이터 추출
  let collections = getCollections(dummy_data);
  
  //1. [백앤드] colllection metadata insert 및 collectionURI 회신
  //required: ownerAddress, name, symbol, description, image_url, banner_url
  for(let i=0;i<collections.length;i++) {
    let collectionURI = await insertCollectionToDB(collections[i]);
    collections[i].collectionURI = collectionURI;
    //console.log(collections[i].collectionURI);
  }

  //2. [프론트] 블록에 collection 생성 및 CA 회신
  //required: abi, bytecode, address, privKey, name, symbol, collectionURI
  for(let i=0;i<collections.length;i++) {
    let arguments = [collections[i].name, collections[i].symbol, collections[i].collectionURI];
    collections[i].contractAddress = await deployContract(abi, bytecode, ownerAddress, privateKey, arguments);
  }

  //3. [백앤드] CA 업데이트
  //required: ca, collectionURI
  for(let i=0;i<collections.length;i++) {
    let inputData = {
      contractAddress: collections[i].contractAddress,
      is_created: true, 
    }
    await updateCollection(inputData, collections[i].collectionURI);
  }

  //4. [백앤드] NFT metadata insert 및 tokenURI 회신
  //required: ca, name, description, traits, imageURI
  for(let i=0;i<dummy_data.length;i++) {
    //각 collection 에 속한 NFT
    let nfts = dummy_data[i].assets;
    for(let j=0;j<nfts.length;j++) {
      let inputData = {
        contractAddress: collections[i].contractAddress,
        metadata: {
          name: nfts[j].name,
          description: nfts[j].description,
          traits: JSON.stringify(nfts[j].traits),
          imageURI: nfts[j].tokenURI,
          ownerAddress: ownerAddress,
          creatorAddress: ownerAddress
        }
      };

      nfts[j].token_URI = await insertNftMeta(inputData);
    }
  }

  //5. [프론트] mintNFT
  //required:
  const mintNftSlowly = async (delayTime) => {
    for(let i=0;i<dummy_data.length;i++) {
      for(let j=0;j<dummy_data[i].assets.length;j++) {
        //console.log(dummy_data[i].assets[j].token_URI);
        console.log(`NFT생성 중 ${dummy_data[i].assets[j].token_URI}`);
        mintNFT(abi, collections[i].contractAddress, ownerAddress, privateKey, dummy_data[i].assets[j].token_URI);
        await new Promise(res => setTimeout(res,delayTime));
      }
    }
  }
  mintNftSlowly(3000);
  
  sequelize.close();
}

const getCollections = (data) => {
  let result = [];

  for(let i=0;i<data.length;i++) {
    result.push({
      is_created: false,
      ownerAddress: ownerAddress,
      name: data[i].name,
      symbol: data[i].name.replace(/(\s*)/g, ""),
      description: data[i].description,
      image_url: data[i].large_image_url,
      banner_url: data[i].banner_image_url,
    });
  }

  return result;
}


// DB 에 collection 내용 insert 후 metadata 반환
const insertCollectionToDB = async (data) => {
  try {
    let result = await Collections.create(data);
    let collectionURI = `${serverPath}/metadata/collection/${result.dataValues.id}`;
    //console.log(collectionURI);
    return collectionURI;
    // Collection Name 이 unique 하다고 가정할 경우
    //let result = await Collections.findOrCreate({where:{name:data.name},defaults:data});
    // if(result[1] === false) {
    //   console.log('컬랙션 명이 이미 존재합니다');
    // } else {
    //   let output = `http://localhost:4000/metadata/collection/${result[0].dataValues.id}`;
    //   console.log(output);  
    // }
  }
  catch(err) {
    console.log(err);
  }
};

//컨트랙트 디플로이
const deployContract = async (MyAbi, MyBytecode, pubAddr, privAddr, arguments) => {
  try {
    //스마트 컨트랙트 객체를 생성
    const contractObj = new web3.eth.Contract(
      MyAbi,
      pubAddr, // The address of the smart contract to call.
      {
          from: pubAddr, // The address transactions should be made from.
          gasPrice: "2000000", // default gas price in wei, 20 gwei in this case
      }
    );

    web3.eth.accounts.wallet.add(privAddr);

    //deploy
    const newContractInstance = await contractObj.deploy({
      data: MyBytecode,
      arguments: arguments,
    }).send({
      from: Web3.utils.toChecksumAddress(pubAddr),
      gas: 6721975,
      gasPrice: "200000",
    });
  
    console.log(`======== instance with the new contract address ========`);
    console.log(newContractInstance.options.address);
    return newContractInstance.options.address;
  }
  catch(err) {
      console.log(err);
  }
}

//CA정보 업데이트
const updateCollection = async (data, collection_uri) => {
  try {
    let myId = collection_uri.replace(`${serverPath}/metadata/collection/`,'');
    
    let result = await Collections.update(data,
      {where: {id: myId}}
    );
     
    console.log(result);
  }
  catch(err) {
    console.log(err);
  }
};

const insertNftMeta = async (data) => {
  try {
    let result = await NFTs.create({
      is_minted: false,
      contractAddress: data.contractAddress,
      name: data.metadata.name,
      description: data.metadata.description,
      traits: data.metadata.traits,
      imageURI: data.metadata.imageURI
    });
    //console.log(result);

    let output = `${serverPath}/metadata/nft/${result.dataValues.id}`;
    console.log(output);
    return output;
  }
  catch(err) {
    console.log(err);
  }
};

const mintNFT = async (MyAbi, MyCA, pubAddr, privAddr, tokenURI) => {
  //ERC721 컨트랙트 객체 생성
  const contractObj = new web3.eth.Contract(
    MyAbi, MyCA, 
    {
      from: pubAddr,
      gasPrice: "200000",
    }
  );

  //보낼 트랜잭션 데이터 생성
  const data = contractObj.methods.mintNFT(tokenURI).encodeABI();

  //트랜잭션에 server 서명
  signedTx = await web3.eth.accounts.signTransaction(
      {
          to: MyCA, //받는 사람이 아니라, 계약주소임. 받는 사람은 transfer 함수에 설정
          gas: 6721975,
          data: data,
      }, privAddr);

  //트랜잭션 발송
  rtnTran = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

//실행
//main();



const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { Transactions, Collections, NFTs, sequelize } = require(".././models");
const fs = require('fs');
const path = require("path");
const basePath = __dirname;

/*============ 수동으로 입력해야 할 정보 =================*/
//NFT 보유자 지갑 정보
const ownerAddress = '0x7C103842366E592158569cFb732AD6c373714523';
const privateKey = 'e317944870dd3ce63ad08aac9f673d192e15782227c97a79e7121e31cba7108e';

//NFT 의 컬랙션 정보
const ca = '0x15218408995Ba649A303cA3Dc86Dd38a1608dd5f';

//NFT 토큰 정보
const iToken_ids = 1;

//가격
const iPrice = 2; //eth

/*==========================================================*/
const abi = require("./MyERC721_ABI");
const bytecode = require("./MyERC721_Bytecode");
const serverPath = 'http://localhost:4000';

const abiDecoder = require('abi-decoder'); // NodeJS
abiDecoder.addABI(abi);
/*==========================================================*/

//sell transaction 확인
/*
{
  name: 'sell',
  params: [
    { name: 'tokenId', value: '1', type: 'uint256' },
    { name: 'price', value: '13', type: 'uint256' }
  ]
}
{
  name: 'sell',
  params: [
    { name: 'tokenId', value: '1', type: 'uint256' },
    { name: '_price', value: '2000000000000000000', type: 'uint256' }
  ]
}
*/
/*
  *Collection 컨트랙트
  ownedOf(token_ids)  => NFT 소유자
  tokenURI(token_ids) => NFT metadata

  getIsSelling(token_ids) => 판매 여부
  getApproved(token_idx) => 트레이드 CA 확인

  *Trade 컨트랙트
  getPrice()  => 판매가격

*/
const checkDecode = async (input) => {
  //rtnTran = value.logs[1].data;
  //console.log(rtnTran);

  let rtnTran = await web3.eth.getTransaction(input);
  console.log(rtnTran)

  const decodedData = abiDecoder.decodeMethod(rtnTran.input);

  console.log('--------------------------------')
  console.log(decodedData);
  
}
checkDecode('0x203e97e90ffad6c4ebafb4683bfe3fc60b24423247f5d5da639327d5dcd9d91e');

//sell
const sell = async (MyAbi, MyCA, pubAddr, privAddr, MyToken_ids, MyPrice) => {
  //블록에 던져줄 정보는 token_ids, price 임
  MyPrice = web3.utils.toWei(String(MyPrice), "ether")
  console.log(MyPrice);

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
const isSelling = async (MyAbi, MyCA, pubAddr, privAddr, MyToken_ids) => {
  //블록에 던져줄 정보는 token_ids, price 임
  
  //ERC721 컨트랙트 객체 생성
  const contractObj = new web3.eth.Contract(
    MyAbi, MyCA, 
    {
      from: pubAddr,
      gasPrice: "200000",
    }
  );

  //보낼 call
  const getIsSelling = await contractObj.methods.getIsSelling(MyToken_ids).call();
  const getApproved = await contractObj.methods.getApproved(MyToken_ids).call();
  
  console.log(getIsSelling);
  console.log(getApproved);
}
//isSelling(abi, ca, ownerAddress, privateKey, iToken_ids);




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



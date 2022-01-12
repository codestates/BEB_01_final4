const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { Transactions, Collections, NFTs, sequelize } = require(".././models");
const fs = require('fs');
const path = require("path");
const basePath = __dirname;

/*============ Collection owner 지갑 주소 필요 =================*/
const ownerAddress = '0x37dF256a4977f8A5FB7044e7D60E669F14b23283';
const privateKey = 'df9619608102d2e5e560aaf59c0e9c46beac1276b3441ec45b36a0837c3394f0';

const abi = require("./MyERC721_ABI");
const bytecode = require("./MyERC721_Bytecode");
const serverPath = 'http://localhost:4000';
/*==========================================================*/


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
  for(let i=0;i<5;i++) {
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
    for(let i=0;i<5;i++) {
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
main();



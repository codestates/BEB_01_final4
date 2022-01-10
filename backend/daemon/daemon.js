const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { Transactions, Collections, NFTs, sequelize } = require(".././models");
const fs = require('fs');
const path = require("path");
const basePath = __dirname;
/*
 *  [1회 실행] node daemon.js
 *  [데몬 실행] npx pm2 start daemon.js --cron "* * * * *"
 *  [상태 보기] npx pm2 status
 *  [모니터링 보기] npx pm2 monit
 *  [종료] npx pm2 delete 0
 */

/*
 *==================== 필요한 정보 입력 =======================
 */
  // ABI
  const abi = require("./MyERC721_ABI");

  // 조회를 원하는 시작 블록 번호
  //let startBlockNumber = 0; 
  let startBlockNumber = Number(
    fs.readFileSync(path.join(basePath, '/blockNumber'), {
      encoding: 'utf-8',
    }),) + 1;
 /*=======================================================*/

const abiDecoder = require('abi-decoder'); // NodeJS
abiDecoder.addABI(abi);
let curBlkNum = 0;


const getTranByCollection = async (tx_id, collection_id) => {
  try {
    let tx = await web3.eth.getTransaction(tx_id);

    if (tx.from === collection_id || tx.to === collection_id) {
      const decodedData = abiDecoder.decodeMethod(tx.input);
      
      //input 가공
      tx.input_name = decodedData.name;
      tx.input_params_name = decodedData.params[0].name;
      tx.input_params_value = decodedData.params[0].value;
      
      return tx;
    }
  }
  catch(err) {
    console.log(err);
  }
}

const getTokenID = async(MyAbi, MyCA, targetTokenURI) => {
  const tokenContract = await new web3.eth.Contract(
    MyAbi,
    MyCA,
    //{from:pubAddr}
  );
  
  const totalSupply = await tokenContract.methods.totalSupply().call();
  for(let i=1;i<=Number(totalSupply);i++) {
    let tokenURI = await tokenContract.methods.tokenURI(i).call();
    if(tokenURI === targetTokenURI) {
      //console.log(`[getTokenID] 찾았다 요놈 ${tokenURI}`);
      return i;
    }
  }
}

//트랜잭션 정보 받아서, NFT 검증(token_ids확인) 후 update
const updateNFTtoDB = async (tx, MyCA, MyAbi) => {
  try {
    // 만약 mintNFT 트랜잭션이라면
    if(tx.input_name === 'mintNFT') {
      //토큰ID 조회
      let tokenID = await getTokenID(MyAbi, MyCA, tx.input_params_value);
      const inputData = {
        is_minted: true,
        token_ids: tokenID,
        tokenURI: tx.input_params_value,
      }

      //해당 tokenURI 를 가진 데이터를 DB에서 확인 후 업데이트
      let targetId = inputData.tokenURI.replace('http://localhost:4000/metadata/nft/','');    
      let result = await NFTs.update(inputData,
        {
          where: {
            id: targetId,
            is_minted: false
          }
        }
      );
    }
  }
  catch(err) {
    console.log(err);
  }
};

//메인 함수
const monitAndUpdateNFT = async (MyCA, MyAbi, startBlkNum) => {
  try {
    //현재 블록체인 상의 현재 블록 번호 조회
    curBlkNum = await web3.eth.getBlockNumber();
    if(startBlkNum > curBlkNum) {
      //console.log(`최신 블록까지 이미 조회 완료 : ${startBlkNum}`);
      return;
    }

    //조회하고자 하는 블록들 조회하여 모든 트랜ID 추출
    let arrTranIDs = [];
    for(let j=startBlkNum;j<(curBlkNum+1);j++) {
      let block = await web3.eth.getBlock(j);
      let tranIDs = block.transactions;
      
      //한 블록에 존재하는 모든 트랜잭션 ID
      for(let i=0;i<tranIDs.length;i++) {
        arrTranIDs.push(tranIDs[i]);
      }
    }
    
    //특정 collection과 관련 있는 tran을 필터하여 정보를 저장
    let arrTrans = [];
    for(let i=0;i<arrTranIDs.length;i++) {
      let tranOfCollection = await getTranByCollection(arrTranIDs[i], MyCA);
      if(tranOfCollection) {
        arrTrans.push(tranOfCollection);
      }
    }
    //console.log(arrTrans);

    if(arrTrans.length === 0) console.log('no transaction');
    for(let i=0;i<arrTrans.length;i++) {
      // Transactions 테이블 insert
      await Transactions.findOrCreate({where:{hash:arrTrans[i].hash},default:arrTrans[i]});
    
      // NFTs 테이블 update
      await updateNFTtoDB(arrTrans[i], MyCA, MyAbi);
    }
  }
  catch(err) {
  }
}

//실행
const monitByCollection = async (MyAbi, START_BLOCK) => {
  try {
    const collections = await Collections.findAll({where:{is_created:true}});
    
    for(let i=0;i<collections.length;i++) {
      console.log(`==== 컬랙션 검사 : ${collections[i].contractAddress} ====`);
      await monitAndUpdateNFT(collections[i].contractAddress, MyAbi, START_BLOCK);
    }

    // 가장 마지막에 확인한 블록번호 저장
    if(curBlkNum >= START_BLOCK)
      console.log(`==== 해당 블록 모니터링 완료 : ${START_BLOCK} ~ ${curBlkNum} ====`);
    fs.writeFileSync(
      path.join(basePath, '/blockNumber'),
      String(curBlkNum),
    );
    
    sequelize.close();
  }
  catch(err) {
    console.log(err);
  }
}

monitByCollection(abi, startBlockNumber);







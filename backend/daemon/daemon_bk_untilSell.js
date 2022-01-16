const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { Transactions, Collections, NFTs, Trades, sequelize } = require(".././models");
const { Op } = require("sequelize");
const fs = require('fs');
const path = require("path");
const basePath = __dirname;
/*
 *  블록 처음부터 검색하려면 "./blockNumber" 파일 수정 필요 to 0 
 *  [한번 실행] node daemon.js
 *  [1분마다 실행] npx pm2 start daemon.js --cron "* * * * *"
 *  [상태 보기] npx pm2 status
 *  [모니터링 보기] npx pm2 monit
 *  [종료] npx pm2 delete 0
 * 
 *  & 참고 명령어
 *  [DB삭제] drop database gganbu;
 *  [DB생성] npx sequelize-cli db:create
 *  [table삭제] npx sequelize-cli db:migrate:undo
 *  [table생성] npx sequelize-cli db:migrate
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
const { mainModule } = require('process');
const { default: cluster } = require('cluster');
abiDecoder.addABI(abi);
let curBlkNum = 0;


const getTranByCollection = async (tx_id, collection_id) => {
  try {
    let tx = await web3.eth.getTransaction(tx_id);

    if (tx.from === collection_id || tx.to === collection_id) {
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
    const decodedData = abiDecoder.decodeMethod(tx.input);
    tx.input_name = decodedData.name;

    // 만약 mintNFT 트랜잭션이라면
    if(tx.input_name === 'mintNFT') {
      tx.input_params_name = decodedData.params[0].name;
      tx.input_params_value = decodedData.params[0].value;
      
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
            is_minted: {
              [Op.not]: true
            }
            //is_minted: null
          }
        }
      );
      console.log(`number of minted NFTs : ${result}`);
    }
    // 만약 sell 트랜잭션이라면
    else if(tx.input_name === 'sell') {
      //tx[decodedData.params[0].id] = decodedData.params[0].value;
      tx.input_tokenId = decodedData.params[0].value;
      tx.input_price = decodedData.params[1].value;

      //trade contractAddress 조회
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );
      const getApproved = await contractObj.methods.getApproved(tx.input_tokenId).call();
      const getIsSelling = await contractObj.methods.getIsSelling(tx.input_tokenId).call();
      
      let status = '';
      if(getIsSelling == true) {
        status = 'selling';
      }

      //wei -> ether
      tx.input_price = await web3.utils.fromWei(tx.input_price, "ether");
      
      //토큰ID 조회
      const inputData = {
        token_ids: tx.input_tokenId,
        collectionAddress: MyCA,
        status: status,
        trade_ca: getApproved,
        price: tx.input_price,
        seller: tx.from,
        buyer: null
      };

      let result = await Trades.findOrCreate({
        where:{
          trade_ca: getApproved
        },
        defaults:inputData
      });
      console.log(`========== New trade has been enrolled=======`);
      console.log(result[0].dataValues);
      
      // if(result[1] === false) {
      //   console.log('Trade 가 이미 존재합니다');
      // } else {
      //   console.log(`number of trade enrolled : ${result[0].dataValues}`);
      // }
    }
  }
  catch(err) {
    console.log(err);
  }
};

//메인 함수
const monitAndUpdateNFT = async (MyCA, MyAbi, startBlkNum, curBlkNum) => {
  try {
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
      await Transactions.create(arrTrans[i]);
    
      // NFTs 테이블 update
      await updateNFTtoDB(arrTrans[i], MyCA, MyAbi);
    }
  }
  catch(err) {
  }
}

//컬랙션 별로 신규 mintNFT, 신규 trade 모니터링
const monitByCollection = async (MyAbi, START_BLOCK, END_BLOCK) => {
  try {
    const collections = await Collections.findAll({where:{is_created:true}});
    
    for(let i=0;i<collections.length;i++) {
      console.log(`==== 컬랙션 검사 : ${collections[i].contractAddress} ====`);
      await monitAndUpdateNFT(collections[i].contractAddress, MyAbi, START_BLOCK, END_BLOCK);
    }
  }
  catch(err) {
    console.log(err);
  }
}

//selling 중인 Trades CA 를 모니터링
  /*
  * 가격이 같고, 해당 트레이트ca에 가격이 보내졌다면 buy 가 요청된 것이다
  * 검증: token 거래 상태 확인(false인지), 해당 token owner 가 tx.from 으로 변경됐는지 확인
  * 검증 결과가 pass 되면
  * NFTs(ownerAddress 를 tx.from 으로 업데이트),
  * Trades(status 를 'completed' 로 업데이트)
  * Trades(buyer 를 tx.from 으로 업데이트) 
  */
const monitAndUpdateTrade = async (MyAbi, MyCA, tradeCA, MyToken_ids, startBlkNum) => {
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

//트레이드 별로 buy, cancel 이벤트 모니터링
const monitByTrade = async (MyAbi, START_BLOCK, END_BLOCK) => {
  try {
    const trades = await Tradss.findAll({where:{status:'selling'}});
    
    for(let i=0;i<trades.length;i++) {
      console.log(`==== 거래(Trades) 검사 : ${trades[i].trade_ca}  ====`);
      
      await monitAndUpdateTrade(
        MyAbi, 
        trades[i].collectionAddress,      //컬랙션 CA 
        trades[i].trade_ca,               //NFT 거래 CA
        trades[i].token_ids,              //NFT 토큰ID
        START_BLOCK,
        END_BLOCK);
    }
  }
  catch(err) {
    console.log(err);
  }
}

const main = async (MyAbi, START_BLOCK) => {
  try {
    //블록체인 상의 마지막 블록 번호 조회
    let curBlkNum = await web3.eth.getBlockNumber();
    if(START_BLOCK > curBlkNum) {
      console.log(`최신 블록까지 이미 조회 완료 : ${curBlkNum}`);
      return;
    }

    monitByCollection(MyAbi, START_BLOCK, curBlkNum);
    //monitByTrade(MyAbi, START_BLOCK, curBlkNum);

    // 가장 마지막에 확인한 블록번호 저장
    if(curBlkNum >= START_BLOCK)
      console.log(`==== 블록 모니터링 완료 : ${START_BLOCK} ~ ${curBlkNum} ====`);
      fs.writeFileSync(
        path.join(basePath, '/blockNumber'),
        String(curBlkNum),
      );
    
    sequelize.close();
  }
  catch(e) {
    console.log(`에러 : ${e.message}`);
  }
}

main(abi, startBlockNumber);





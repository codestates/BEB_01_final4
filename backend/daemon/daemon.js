const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { Transactions, Collections, NFTs, Trades, sequelize } = require(".././models");
const { Op, ConnectionTimedOutError } = require("sequelize");
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

let COUNT = {
  "minted" : 0,
  "sell" : 0,
  "buy" : 0,
  "cancel" : 0
};

//트랜잭션 가져오기
const fetchTranIDs = async (startBlkNum, curBlkNum) => {
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

    return arrTranIDs
  }
  catch(err) {
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
      if(result > 0) {
        console.log(`========== New NFT has been enrolled =======`);
        COUNT.minted++;
      }
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
      //const getApproved = await contractObj.methods.getApproved(tx.input_tokenId).call();
      const getIsSelling = await contractObj.methods.getIsSelling(tx.input_tokenId).call();
      
      //wei -> ether
      tx.input_price = await web3.utils.fromWei(tx.input_price, "ether");
      
      //토큰ID 조회
      const inputData = {
        token_ids: tx.input_tokenId,
        collectionAddress: MyCA,
        status: 'selling',
        //trade_ca: getApproved,
        price: tx.input_price,
        seller: tx.from,
        buyer: null,
        sellHash: tx.hash
      };

      let result = await Trades.findOrCreate({
        where:{
          collectionAddress: MyCA,
          token_ids: tx.input_tokenId,
          //status: 'selling',
          sellHash: tx.hash
        },
        defaults:inputData
      });

      // let status = '';
      // if(getIsSelling == true) {
      //   status = 'selling';
      // } else {
      //   //throw new Error('[sell 등록 중] 판매 중이 아님');
      // }

      if(result[1] === true) {
        console.log(`========== New trade has been enrolled=======`);
        console.log(result[0].dataValues);
        COUNT.sell++;
      }
    }
    // 만약 payment(1), 즉 buy 트랜잭션이라면
    else if(tx.input_name === 'payment' && Number(decodedData.params[0].value) == 1) {
      tx.input_tokenId = Number(decodedData.params[1].value);
      tx.input_price = Number(tx.value);
      //console.log(`${tx.to}   ${tx.input_tokenId}`);

      //trade contractAddress 조회
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );

      //DB업데이트
      await NFTs.update(
        {
          ownerAddress: tx.from
        },
        {
          where: {contractAddress: MyCA}
        }
      );

      const result = await Trades.update(
        {
          status: 'completed',
          buyer: tx.from,
          buyHash: tx.hash
        },
        {
          where: {
            status: 'selling',
            collectionAddress: tx.to,
            token_ids: tx.input_tokenId,
          },
        }
      );

      // 판매 검증 로직
      // const getIsSelling = await contractObj.methods.getIsSelling(tx.input_tokenId).call();
      // const ownerOf = await contractObj.methods.ownerOf(tx.input_tokenId).call();
      
      // //현재 owner 가 buy 요청한 사람과 동일한지 확인
      // if(ownerOf != tx.from) {
      //   throw new Error('[payment option 1 트랜잭션 검증 중] NFT 소유자 불일치');
      // }

      // //판매가 완료된 건인지 블록 검증
      // if(getIsSelling == true) {
      //   throw new Error('[payment option 1 트랜잭션 검증 중] getIsSelling 이 여전히 true');
      // }

      if(result > 0) {
        console.log(`========== Trade has been dealed =======`);
        console.log(tx);
        COUNT.buy++;
      } else {
        //console.log('buy 업데이트 안됨');
      }
    }
  }
  catch(err) {
    console.log(err);
  }
};

//selling 중인 Trades CA 를 모니터링
/*
* 가격이 같고, 해당 트레이트ca에 가격이 보내졌다면 buy 가 요청된 것이다
* 검증: token 거래 상태 확인(false인지), 해당 token owner 가 tx.from 으로 변경됐는지 확인
* 검증 결과가 pass 되면
* NFTs(ownerAddress 를 tx.from 으로 업데이트),
* Trades(status 를 'completed' 로 업데이트)
* Trades(buyer 를 tx.from 으로 업데이트) 
*/
const updateTrade = async (tx, MyCA, MyAbi, tradeCA, trade) => {
  try {
    console.log(tx);

    //가격 정보 확인
    tx.input_price = await web3.utils.fromWei(tx.value, "ether");
    console.log(`가격 : ${tx.input_price} eth`);

    //DB의 가격정보와 같은지 확인필요
    if(trade.price != tx.input_price) {
      throw new Error('가격 불일치');
    }

    const contractObj = new web3.eth.Contract(
      MyAbi, MyCA,
    );
    const ownerOf = await contractObj.methods.ownerOf(trade.token_ids).call();
    const getIsSelling = await contractObj.methods.getIsSelling(trade.token_ids).call();
    
    // //현재 owner 가 buy 요청한 사람과 동일한지 확인
    // if(ownerOf != tx.from) {
    //   throw new Error('NFT 소유자 불일치');
    // }

    // //현재 selling 이 false 인지 확인
    // if(getIsSelling != false) {
    //   //사자마자 다시 판매등록 할수는 있지만, 앱에서는 불가능하다(이 로직이 완료되어야 판매가능하다)
    //   console.log('판매 중임. 즉 거래가 완료되지 않았음');
    //   throw new Error('판매 중임. 즉 거래가 완료되지 않았음');
    // }

    //DB업데이트
    await NFTs.update(
      {
        ownerAddress: tx.from
      },
      {
        where: {contractAddress: trade.collectionAddress}
      }
    );

    await Trades.update(
      {
        status: 'completed',
        buyer: tx.from
      },
      {
        where: {id: trade.id, status: 'selling'},
      }
    );

    console.log(`========== Trade has been dealed =======`);
    console.log(tx);
    COUNT.buy++;
  }
  catch(e) {
    console.log(`에러 : ${e.message}`);
  }  
}


const main = async (MyAbi, START_BLOCK) => {
  try {
    //블록체인 상의 마지막 블록 번호 조회
    let curBlkNum = await web3.eth.getBlockNumber();
    if(START_BLOCK > curBlkNum) {
      console.log(`==== 최신 블록까지 이미 조회 완료 : ${curBlkNum} ====`);
      return;
    }

    //collection 리스트
    const collections = await Collections.findAll({where:{is_created:true}});
    
    //selling trade 리스트
    const trades = await Trades.findAll({where:{status:'selling'}});
    
    //블록 범위 내 트랜 IDs 추출
    const arrTranIDs = await fetchTranIDs(START_BLOCK, curBlkNum);
   
    //모든 트랜잭션에 대하여 검사
    for(let i=0;i<arrTranIDs.length;i++) {
      let tx = await web3.eth.getTransaction(arrTranIDs[i]);
      
      //컬랙션 별로 mintNFT, selling, buy 관련 TX 인지 검사
      for(let j=0;j<collections.length;j++) {
        let MyCA = collections[j].contractAddress;

        if (tx.from === MyCA || tx.to === MyCA) {
          //DB 업데이트
          await Transactions.findOrCreate({
            where:{hash:tx.hash},
            defaults:tx
          });
          await updateNFTtoDB(tx, MyCA, MyAbi);
        }
      }

      //트레이드CA 별로 buy, cancel 관련 TX 인지 검사
      // for(let j=0;j<trades.length;j++) {
      //   let tradeCA = trades[j].trade_ca;

      //   if (tx.to === tradeCA) {
      //     //DB 업데이트
      //     await Transactions.findOrCreate({
      //       where:{hash:tx.hash},
      //       defaults:tx
      //     });

      //     await updateTrade(
      //       tx,
      //       trades[j].collectionAddress,      //컬랙션 CA 
      //       MyAbi, 
      //       tradeCA,                             //NFT 거래 CA
      //       trades[j]);             //NFT 토큰ID 
      //   }
      // }
    }    

    // 가장 마지막에 확인한 블록번호 저장
    if(curBlkNum >= START_BLOCK) {
      console.log(`==== 블록 모니터링 완료 : ${START_BLOCK} ~ ${curBlkNum} ====`);
      fs.writeFileSync(
        path.join(basePath, '/blockNumber'),
        String(curBlkNum),
      );
    }
    console.log(`# of minted          : ${COUNT.minted}`);
    console.log(`# of sell enrollment : ${COUNT.sell}`);
    console.log(`# of traded          : ${COUNT.buy}`);
    console.log(`# of sell cancelled  : ${COUNT.cancel}`);
    
      

    
    sequelize.close();
  }
  catch(e) {
    console.log(`에러 : ${e.message}`);
  }
}

main(abi, startBlockNumber);





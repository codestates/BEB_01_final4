const config = require('../config/config');
const hostURI = config.development.host_metadata;
const web3URI = config.development.web3_uri;
const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const web3 = new Web3(new Web3.providers.HttpProvider(web3URI));
const { Transactions, Collections, NFTs, Trades, Rents, GGanbu_wallets, GGanbu_members, Vote_suggestions, Vote_submits, sequelize } = require(".././models");
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
  const coffer_abi = require("./CofferERC721_ABI");

  // 조회를 원하는 시작 블록 번호
  //let startBlockNumber = 110; 
  let startBlockNumber = Number(
    fs.readFileSync(path.join(basePath, '/blockNumber'), {
      encoding: 'utf-8',
    }),) + 1;
/*=======================================================*/

const abiDecoder = require('abi-decoder'); // NodeJS
//const { mainModule } = require('process');
//const { default: cluster } = require('cluster');
abiDecoder.addABI(abi);
abiDecoder.addABI(coffer_abi);
let curBlkNum = 0;

let COUNT = {
  "minted" : 0,
  "sell" : 0,
  "buy" : 0,
  "cancel" : 0,
  "lend" : 0,
  "rent" : 0,
  "returnNFT" : 0,
  "suggestion_join" : 0,
  "suggestion_sell" : 0,
  "suggestion_buy" : 0,
  "suggestion_lend" : 0,
  "suggestion_rent" : 0,
  "suggestion_join_approved" : 0,
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
  catch(e) {
    console.log(e.message);
  }
}

const getTokenID = async(MyAbi, MyCA, targetTokenURI) => {
  try {
    const tokenContract = await new web3.eth.Contract(MyAbi, MyCA);
    
    const totalSupply = await tokenContract.methods.totalSupply().call();
    for(let i=1;i<=Number(totalSupply);i++) {
      let tokenURI = await tokenContract.methods.tokenURI(i).call();
      if(tokenURI === targetTokenURI) {
        return i;
      }
    }
  }
  catch(e) {
    console.log(e.message);
  }
}

//트랜잭션 정보 받아서, NFT 검증(token_ids확인) 후 update
const updateNFTtoDB = async (tx, txID, MyCA, MyAbi) => {
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
      tx.input_tokenId = decodedData.params[0].value;
      tx.input_price = decodedData.params[1].value;

      //trade contractAddress 조회
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );
      
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

      //검증 작업: 해당 func은 블록의 현재 상태를 보여줄 뿐이다. 따라서 블록을 0부터 조회하면 과거 트랜정보 검증은 불가능함
      //const getApproved = await contractObj.methods.getApproved(tx.input_tokenId).call();
      //const getIsSelling = await contractObj.methods.getIsSelling(tx.input_tokenId).call();
      // if(getIsSelling == true) {
      //   //판매 중
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
      //만약 깐부지갑 소유의 NFT 를 구매한 것이라면
      //event에 Transfer 라는 이벤트의 from 이 깐부지갑인 것을 찾는다
      let txReceipt = await web3.eth.getTransactionReceipt(txID);
      decodedLogs = abiDecoder.decodeLogs(txReceipt.logs);

      for(let i=0;i<decodedLogs.length;i++) {
        if(decodedLogs[i].name == 'Transfer') {
          for(let j=0;j<decodedLogs[i].events.length;j++) {
            //깐부 리스트
            const gganbus = await GGanbu_wallets.findAll({where:{}});
            
            //깐부지갑을 뒤져서 from 주소값과 같은 깐부지갑이 있는지 확인
            for(let gNum=0;gNum<gganbus.length;gNum++) {
              if(decodedLogs[i].events[j].name == 'from') { 
                if(Web3.utils.toChecksumAddress(decodedLogs[i].events[j].value) == gganbus[gNum].gganbuAddress) {
                  //특정 깐부지갑의 NFT 를 구매했다면 깐부지갑 정보 업데이트
                  const balance = await web3.eth.getBalance(gganbus[gNum].gganbuAddress);
                  const iBalance = web3.utils.fromWei(balance, 'ether');
                  console.log(iBalance);
                  await GGanbu_wallets.update(
                    {
                      status: 'closed',
                      isActive: false,
                      balance: iBalance
                    },
                    {
                      where:{
                        gganbuAddress: gganbus[gNum].gganbuAddress
                      },
                  });
                  console.log(`========== GGanbu NFT has been transferred to other person =======`);
                }
              }
            }
            
          }
        }
      }

      tx.input_tokenId = Number(decodedData.params[1].value);
      tx.input_price = Number(tx.value);
      
      //현재는 payment 가 늘 성공했다고 가정하고 있다.
      //블록의 현재 상태와 과아아아거 트랜의 비교가 불가능하다면 최소한 price는 검증할 필요가 있다

      //DB업데이트
      await NFTs.update(
        {
          ownerAddress: tx.from
        },
        {
          where: {
            contractAddress: tx.to,
            token_ids: tx.input_tokenId
          }
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

      //검증 작업: 해당 func은 블록의 현재 상태를 보여줄 뿐이다. 따라서 블록을 0부터 조회하면 과거 트랜정보 검증은 불가능함
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
    // 만약 rent, 즉 대여 등록(isLend) 트랜잭션이라면
    else if(tx.input_name === 'rent') {
      tx.input_tokenId = decodedData.params[0].value;
      tx.input_price = decodedData.params[1].value;

      //trade contractAddress 조회
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );
      
      //wei -> ether
      tx.input_price = await web3.utils.fromWei(tx.input_price, "ether");
      
      //insert data
      const inputData = {
        token_ids: tx.input_tokenId,
        collectionAddress: tx.to,
        status: 'lend',
        price: tx.input_price,
        owner: tx.from,
        renter: null,
        rent_period: null,
        lendHash: tx.hash
      };

      let result = await Rents.findOrCreate({
        where:{
          collectionAddress: tx.to,
          token_ids: tx.input_tokenId,
          lendHash: tx.hash
        },
        defaults:inputData
      });

      if(result[1] === true) {
        console.log(`========== New lend has been enrolled=======`);
        console.log(result[0].dataValues);
        COUNT.lend++;
      }
    }
    // 만약 payment(2), 즉 rent 트랜잭션이라면
    else if(tx.input_name === 'payment' && Number(decodedData.params[0].value) == 2) {
      tx.input_tokenId = Number(decodedData.params[1].value);
      tx.input_price = Number(tx.value);
      
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );

      //현재는 payment 가 늘 성공했다고 가정하고 있다.
      //블록의 현재 상태와 과아아아거 트랜의 비교가 불가능하다면 최소한 price는 검증할 필요가 있다

      //DB업데이트
      await NFTs.update(
        {
          //ownerAddress: tx.from
          renterAddress: tx.from
        },
        {
          where: {
            contractAddress: tx.to,
            token_ids: tx.input_tokenId
          }
        }
      );

      const result = await Rents.update(
        {
          status: 'rent',
          renter: tx.from,
          rentHash: tx.hash
        },
        {
          where: {
            status: 'lend',
            collectionAddress: tx.to,
            token_ids: tx.input_tokenId,
          },
        }
      );

      //검증 작업: 해당 func은 블록의 현재 상태를 보여줄 뿐이다. 따라서 블록을 0부터 조회하면 과거 트랜정보 검증은 불가능함
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
        console.log(`========== Rent has been dealed =======`);
        console.log(tx);
        COUNT.rent++;
      } else {
        //console.log('buy 업데이트 안됨');
      }
    }
    // 만약 returnNFT, 즉 대여 반납 트랜잭션이라면
    else if(tx.input_name === 'returnNFT') {
      tx.input_tokenId = Number(decodedData.params[0].value);
      
      const contractObj = new web3.eth.Contract(
        MyAbi, MyCA,
      );

      //현재는 payment 가 늘 성공했다고 가정하고 있다.
      //블록의 현재 상태와 과아아아거 트랜의 비교가 불가능하다면 최소한 price는 검증할 필요가 있다

      //DB업데이트
      await NFTs.update(
        {
          //ownerAddress: tx.from
          renterAddress: null
        },
        {
          where: {
            contractAddress: tx.to,
            token_ids: tx.input_tokenId
          }
        }
      );

      const result = await Rents.update(
        {
          status: 'completed',
          //renter: tx.from,
          //rentHash: tx.hash
        },
        {
          where: {
            status: 'rent',
            collectionAddress: tx.to,
            token_ids: tx.input_tokenId,
          },
        }
      );

      if(result > 0) {
        console.log(`========== Rent NFT has been returned =======`);
        console.log(tx);
        COUNT.returnNFT++;
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
* 해당 트레이드 ca에 동일 가격이 보내졌다면 buy 가 요청된 것이다
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

//트랜잭션 정보 받아서, 깐부 관련 정보는 DB에 적재
const updateGGanbuActivity = async (tx, txID, MyCA, MyAbi) => {
  try {
    const decodedData = abiDecoder.decodeMethod(tx.input);
    tx.input_name = decodedData.name;

    let txReceipt = await web3.eth.getTransactionReceipt(txID);
    
    // join
    if(tx.input_name === 'requestJoin') {
      decodedLogs = abiDecoder.decodeLogs(txReceipt.logs);
      //console.log(decodedLogs[0].name); <= 'set_suggestion'

      //데이터
      let iSuggestionIdx;
      let iType;
      let iJoiner;
      let iPrice;

      //events
      for(let i=0;i<decodedLogs[0].events.length;i++) {
        let eventName = decodedLogs[0].events[i].name;
        let eventValue = decodedLogs[0].events[i].value;

        if(eventName == '_suggestionIdx') {
          iSuggestionIdx = eventValue;
        } else if(eventName == '_target') {
          //join 시 해당 값은 참여자 지갑주소
          iJoiner = Web3.utils.toChecksumAddress(eventValue);
        } else if(eventName == '_type') {
          iType = 'join';
        } else if(eventName == '_tokenId') {
          //join 시 해당 값은 의미없음
        } else if(eventName == '_price') {
          iPrice = await web3.utils.fromWei(eventValue, "ether");
        }
      }

      //insert data
      const inputData = {
        suggestion_idx: iSuggestionIdx,
        orgAddress: tx.to,
        option: 'gganbu',
        type: iType,
        targetAddress: null,
        targetTokenId: null,
        targetPrice: null,
        totalAccept: 0,
        totalReject: 0,
        totalAcceptRatio: 0,
        totalRejectRatio: 0,
        suggestedAt: new Date(),
        status: 'in progress',
        isValid: true,
        joiner: iJoiner,
        joiner_staking_value: iPrice
      };

      let result = await Vote_suggestions.findOrCreate({
        where:{
          suggestion_idx: iSuggestionIdx,
          orgAddress: tx.to,
        },
        defaults:inputData
      });

      if(result[1] === true) {
        console.log(`========== New suggestion(join) has been enrolled=======`);
        console.log(result[0].dataValues);
        COUNT.suggestion_join++;
      }
    }
    // vote
    else if(tx.input_name === 'vote') {
      let targetCollectionAddress;
      let targetTokenId;
      
      tx.input_suggestion_idx = decodedData.params[0].value;
      tx.input_vote = decodedData.params[1].value;
      
      let iAccept = 0, iReject = 0;
      if(tx.input_vote == true) {
        iAccept++;
      } else {
        iReject++;
      }


      //투표 이벤트 업데이트 (Vote_suggestions)
      //totalAccept, totalAcceptRatio, totalReject, totalRejectRatio
      let qSuggestion = await Vote_suggestions.findOne({
        where:{
          suggestion_idx: tx.input_suggestion_idx,
          orgAddress: tx.to,
        },
      });
      
      let qMembers = await GGanbu_members.findAll({
        where: {gganbuAddress: qSuggestion.orgAddress}
      })

      const qVote = await Vote_submits.findOrCreate({
        where:{
          suggestion_id: qSuggestion.id,
          memberAddress: tx.from
        },
        defaults: {
          suggestion_id: qSuggestion.id,
          memberAddress: tx.from,
          vote: tx.input_vote
        }
      });
      if(qVote[1] == true) {
        let numOfMembers = qMembers.length;
        let totalAccept = qSuggestion.totalAccept + iAccept;
        let totalReject = qSuggestion.totalReject + iReject;
        let totalAcceptRatio = totalAccept / numOfMembers * 100;
        totalAcceptRatio = Math.round(totalAcceptRatio * 100) / 100;
        let totalRejectRatio = totalReject / numOfMembers * 100;
        totalRejectRatio = Math.round(totalRejectRatio * 100) / 100;
        
        const suggestionData = {
          totalAccept: totalAccept,
          totalReject: totalReject,
          totalAcceptRatio: totalAcceptRatio,
          totalRejectRatio: totalRejectRatio,
        };
        
        await Vote_suggestions.update(suggestionData,
          {
            where:{
              id: qSuggestion.id
            },
        });
      }

      //투표 이벤트 (Vote_Submits) insert
      //suggestion_id, memberAddress, vote
      decodedLogs = abiDecoder.decodeLogs(txReceipt.logs);
      
      for(let i=0;i<decodedLogs.length;i++) {
        if(decodedLogs[i].name == 'pass') {
          console.log(`투표결과(찬성) : ${tx.from}`)
          //찬성 결과 업데이트 (Vote_suggestions)
          //status, isValid
          await Vote_suggestions.update(
            {
              status: 'pass',
              isValid: false
            },
            {
              where:{
                id: qSuggestion.id
              },
          });
          console.log(`========== suggestion passed =======`);
          
        } else if(decodedLogs[i].name == 'reject') {
          console.log(`투표결과(반대) : ${tx.from}`)
          //반대 결과 업데이트 (Vote_suggestions)
          await Vote_suggestions.update(
            {
              status: 'reject',
              isValid: false
            },
            {
              where:{
                id: qSuggestion.id
              },
          });
          console.log(`========== suggestion rejected =======`);
            
        } else if(decodedLogs[i].name == 'OwnershipAdd') {
          console.log(`멤버추가: ${decodedLogs[i].events[0].value}`);
          let newMember = Web3.utils.toChecksumAddress(decodedLogs[i].events[0].value);
          
          //사용자 지분 계산 (깐부인 경우에만)
          let qGGanbu = await GGanbu_wallets.findOne({ 
            where: {
              gganbuAddress: tx.to
            },
          });

          let qPrice = await Trades.findOne({ 
            where: {
              collectionAddress: qGGanbu.nft_collectionAddress,
              token_ids: qGGanbu.nft_token_ids,
            },
          });
          let ratio = qSuggestion.joiner_staking_value / Number(qPrice.price) * 100;
          ratio = Math.round(ratio * 100) / 100;
          
          //멤버로 등록하고 금액 추가
          const result = await GGanbu_members.findOrCreate({
            where:{
              memberAddress: newMember,
              gganbuAddress: qSuggestion.orgAddress,
            },
            defaults: {
              memberAddress: newMember,
              gganbuAddress: qSuggestion.orgAddress,
              staking_value: qSuggestion.joiner_staking_value,
              staking_ratio: ratio,
              my_rewards: 0,
              status: 'active',
            }
          });

          //깐부 지갑 balance 정보 수정
          const balance = await web3.eth.getBalance(qSuggestion.orgAddress);
          const iBalance = web3.utils.fromWei(balance, 'ether');
          await GGanbu_wallets.update(
            {
              balance: iBalance
            },
            {
              where:{
                gganbuAddress: qSuggestion.orgAddress
              },
          });

          if(result[1] === true) {
            console.log(`========== New joiner has been enrolled=======`);
            console.log(result[0].dataValues);
            COUNT.suggestion_join_approved++;
          }
        } else if(decodedLogs[i].name == 'payment') {
          //payment 컬랙션주소, 토큰ID, 가격, 옵션
          // 만약 payment(1), 즉 buy 트랜잭션이라면
          if(decodedLogs[i].events[4].value == 1) {
            console.log(`이게 돌아야지1??????`);
            tx.input_tokenId = Number(decodedLogs[i].events[2].value);
            tx.input_price = Number(decodedLogs[i].events[3].value);
            tx.input_collectionAddress = decodedLogs[i].events[1].value;
            
            //payment 가 발생하면 구매를 한거기 때문에 gganbu_wallets 상태가 바뀐다
            await GGanbu_wallets.update(
              {
                status: 'own'
              },
              {
                where:{
                  gganbuAddress: qSuggestion.orgAddress
                },
            });
            
            //DB업데이트
            await NFTs.update(
              {
                ownerAddress: tx.to
              },
              {
                where: {
                  contractAddress: tx.input_collectionAddress,
                  token_ids: tx.input_tokenId
                }
              }
            );
            const result = await Trades.update(
              {
                status: 'completed',
                buyer: tx.to,
                buyHash: tx.hash
              },
              {
                where: {
                  status: 'selling',
                  collectionAddress: tx.input_collectionAddress,
                  token_ids: tx.input_tokenId,
                },
              }
            );
            if(result > 0) {
              console.log(`========== GGanbu Trade has been dealed =======`);
              console.log(tx);
              COUNT.buy++;
            } else {
              //console.log('buy 업데이트 안됨');
            }
          }
        }
        // 만약 sell 제안이 pass 되었다면
        else if(decodedLogs[i].name == '_sell') {
          //데이터
          let iCollectionAddress;
          let iTokenId;
          let iPrice;

          for(let j=0;j<decodedLogs[i].events.length;j++) {
            let eventName = decodedLogs[i].events[j].name;
            let eventValue = decodedLogs[i].events[j].value;
            
            if(eventName == 'collection') {
              iCollectionAddress = Web3.utils.toChecksumAddress(eventValue);
            } else if(eventName == 'tokenId') {
              iTokenId = eventValue;
            } else if(eventName == 'price') {
              iPrice = await web3.utils.fromWei(eventValue, "ether");
            }
          }
          
          //판매 등록을 한거기 때문에 gganbu_wallets 상태가 바뀐다
          // await GGanbu_wallets.update(
          //   {
          //     status: 'selling'
          //   },
          //   {
          //     where:{
          //       gganbuAddress: qSuggestion.orgAddress
          //     },
          // });

          //Sell trade 요청
          const inputData = {
            token_ids: iTokenId,
            collectionAddress: iCollectionAddress,
            status: 'selling',
            price: iPrice,
            seller: tx.to,
            buyer: null,
            sellHash: tx.hash
          };

          let result = await Trades.findOrCreate({
            where:{
              collectionAddress: iCollectionAddress,
              token_ids: iTokenId,
              //status: 'selling',
              sellHash: tx.hash
            },
            defaults:inputData
          });

          if(result[1] === true) {
            console.log(`========== New trade has been enrolled=======`);
            console.log(result[0].dataValues);
            COUNT.sell++;
          }
        }

      }
    }
    // requestTrade
    else if(tx.input_name === 'requestTrade') {
      decodedLogs = abiDecoder.decodeLogs(txReceipt.logs);
      //console.log(decodedLogs[0].name); <= 'set_suggestion'

      //데이터
      let iSuggestionIdx;
      let iType;  //1(판매제안), 2(대여등록 제안), 3(구매제안), 4(대여제안), 5(등록취소?), 6(타겟취소?)
      let iCollectionAddress;
      let iTokenId;
      let iPrice;

      //events
      for(let i=0;i<decodedLogs[0].events.length;i++) {
        let eventName = decodedLogs[0].events[i].name;
        let eventValue = decodedLogs[0].events[i].value;

        if(eventName == '_suggestionIdx') {
          iSuggestionIdx = eventValue;
        } else if(eventName == '_type') {
          if(eventValue == 1) {
            iType = 'sell';
          } else if(eventValue == 2) {
            iType = 'lend';
          } else if(eventValue == 3) {
            iType = 'buy';
          } else if(eventValue == 4) {
            iType = 'rent';
          } else if(eventValue == 5) {
            iType = 'cancel5';
          } else if(eventValue == 6) {
            iType = 'cancel6';
          }
        } else if(eventName == '_target') {
          //NFT 컬랙션 주소
          iCollectionAddress = Web3.utils.toChecksumAddress(eventValue);
        } else if(eventName == '_tokenId') {
          //NFT 토큰ID
          iTokenId = eventValue;
        } else if(eventName == '_price') {
          iPrice = await web3.utils.fromWei(eventValue, "ether");
        }
      }

      //insert data
      const inputData = {
        suggestion_idx: iSuggestionIdx,
        orgAddress: tx.to,
        option: 'gganbu',
        type: iType,
        targetAddress: iCollectionAddress,
        targetTokenId: iTokenId,
        targetPrice: iPrice,
        totalAccept: 0,
        totalReject: 0,
        totalAcceptRatio: 0,
        totalRejectRatio: 0,
        suggestedAt: new Date(),
        status: 'in progress',
        isValid: true,
        joiner: null,
        joiner_staking_value: null
      };

      let result = await Vote_suggestions.findOrCreate({
        where:{
          suggestion_idx: iSuggestionIdx,
          orgAddress: tx.to,
        },
        defaults:inputData
      });

      if(result[1] === true) {
        console.log(`========== New suggestion(${iType}) has been enrolled=======`);
        console.log(result[0].dataValues);
      }
    }
  }
  catch(err) {
    console.log(err);
  }
};


//각 블록의 각 트랜을 순차적으로 조회하여 플랫폼과 관련있는 트랜 정보를 업데이트한다
const main = async (MyAbi, START_BLOCK) => {
  try {
    //블록체인 상의 마지막 블록 번호 조회
    let curBlkNum = await web3.eth.getBlockNumber();
    if(START_BLOCK > curBlkNum) {
      console.log(`==== 최신 블록까지 이미 조회 완료 : ${curBlkNum} ====`);
      return;
    }
    console.log(`==== 최신 블록  번호 : ${curBlkNum} ====`);

    //collection 리스트
    const collections = await Collections.findAll({where:{is_created:true}});
    
    //깐부 리스트
    const gganbus = await GGanbu_wallets.findAll({where:{}});
    
    //selling trade 리스트
    const trades = await Trades.findAll({where:{status:'selling'}});
    
    //블록 범위 내 트랜 IDs 추출
    const arrTranIDs = await fetchTranIDs(START_BLOCK, curBlkNum);
    console.log(`==== 검색할 트랜잭션 갯수: ${arrTranIDs.length} ====`);

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
          await updateNFTtoDB(tx, arrTranIDs[i], MyCA, MyAbi);
        }
      }

      //깐부 지갑 별로 관련 tx 인지 검사
      for(let j=0;j<gganbus.length;j++) {
        let MyCA = gganbus[j].gganbuAddress;

        if (tx.to === MyCA) {
          //DB 업데이트
          await Transactions.findOrCreate({
            where:{hash:tx.hash},
            defaults:tx
          });
          await updateGGanbuActivity(tx, arrTranIDs[i], MyCA, MyAbi);
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
      //       trades[j].collectionAddress,
      //       MyAbi, 
      //       tradeCA,
      //       trades[j]);
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
    console.log(`# of lend enrollment : ${COUNT.lend}`);
    console.log(`# of rent            : ${COUNT.rent}`);
    console.log(`# of returnNFT       : ${COUNT.returnNFT}`);
    console.log(`# of suggestion_join : ${COUNT.suggestion_join}`);
    console.log(`# of suggestion_sell : ${COUNT.suggestion_sell}`);
    console.log(`# of suggestion_buy  : ${COUNT.suggestion_buy}`);
    console.log(`# of suggestion_lend : ${COUNT.suggestion_lend}`);
    console.log(`# of suggestion_rent : ${COUNT.suggestion_rent}`);
    console.log(`# of suggestion_join_approved : ${COUNT.suggestion_join_approved}`);

    sequelize.close();
  }
  catch(e) {
    console.log(`에러 : ${e.message}`);
  }
}

main(abi, startBlockNumber);





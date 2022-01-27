const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { sequelize, NFTs, Collections, Trades, Rents, Users, GGanbu_wallets, GGanbu_members, Vote_suggestions, Vote_submits, DAO_wallets, DAO_members } = require('../models');
const { Op, QueryTypes } = require("sequelize");
const config = require('../config/config');
const hostURI = config.development.host_metadata;

const utils = {
  //NFT instance 넣으면 관련 정보 추가해 줌
  addNftInfo: async (NFT) => {
    try {
      const collection = await Collections.findOne({
        where: {
          contractAddress: NFT.contractAddress,
        }
      });
      NFT.collection = collection;
      
      //만약 Trade 내역이 존재한다면
      NFT.isSelling = false;
      NFT.price = null;
      NFT.trade_ca = null;
      NFT.seller = null;
      NFT.trade_selling = null;
      NFT.isLending = false;
      NFT.lending = null;
      NFT.isRenting = false;
      NFT.renting = null;
      NFT.trade_history = [];
      NFT.rent_history = [];
      NFT.isRecruiting = false;
      NFT.recruiting = null;
      NFT.ownedByGGanbu = false;
      NFT.gganbu = null;
      NFT.gganbu_history = [];
      NFT.hasSuggestion = false;
      NFT.suggestions = null;
      NFT.suggestion_history = [];

      //트레이드 정보 추가
      let qTrades = await Trades.findAll({
        where: {
          token_ids : NFT.token_ids,
          collectionAddress : NFT.contractAddress
        },
        order: [
          ['createdAt', 'DESC']
        ],
      });
      
      //만약 Trade 내역이 존재한다면
      if(qTrades.length > 0) {
        for (let j = 0; j < qTrades.length; j++) {
          //selling 중인 trade 가 있다면
          if(qTrades[j].status == 'selling') {
            NFT.isSelling = true;
            NFT.price = qTrades[j].price;
            NFT.trade_ca = qTrades[j].trade_ca;
            NFT.seller = qTrades[j].seller;
            NFT.trade_selling = qTrades[j].dataValues;
          } else if(qTrades[j].dataValues.status == 'completed') {
            NFT.trade_history.push(qTrades[j].dataValues);
          }
        }
      }

      //Rent 내역 추가
      let qRents = await Rents.findAll({
        where: {
          token_ids : NFT.token_ids,
          collectionAddress : NFT.contractAddress
        },
        order: [
          ['createdAt', 'DESC']
        ],
      });

      //만약 Rent 내역이 존재한다면
      if(qRents.length > 0) {
        for (let j = 0; j < qRents.length; j++) {
          //lend 중인 건이 있다면
          if(qRents[j].status == 'lend') {
            NFT.isLending = true;
            NFT.price = qRents[j].price;
            NFT.seller = qRents[j].owner;
            NFT.lending = qRents[j].dataValues;
          }
          //rent 중인 건이 있다면 
          else if(qRents[j].status == 'rent') {
            NFT.isRenting = true;
            NFT.price = qRents[j].price;
            NFT.seller = qRents[j].owner;
            NFT.renting = qRents[j].dataValues;
          } 
          else if(qRents[j].status == 'completed') {
            NFT.rent_history.push(qRents[j].dataValues);
          }
        }
      }

      //깐부 정보
      let qWallets = await GGanbu_wallets.findAll({
        where: {
          nft_collectionAddress: NFT.contractAddress,
          nft_token_ids: NFT.token_ids
        },
        order: [
          ['createdAt', 'DESC']
        ],
      });

      //만약 GGanbu 내역이 존재한다면
      if(qWallets.length > 0) {
        for (let j = 0; j < qWallets.length; j++) {
          /*
           *suggestion 정보
           */

          let gganbu = qWallets[j].dataValues;
          //members 정보
          let qMembers = await GGanbu_members.findAll({
            where: {
              gganbuAddress: gganbu.gganbuAddress
            },
            // order: [
            //   ['createdAt', 'DESC']
            // ],
          });
          gganbu.members = qMembers;
          
          //recruit 건이 있다면
          if(qWallets[j].status == 'recruit') {
            NFT.isRecruiting = true;
            NFT.recruiting = gganbu;
          }
          //구매 상태 중인 건이 있다면 
          else if(qWallets[j].status == 'own') {
            NFT.ownedByGGanbu = true;
            NFT.gganbu = gganbu;
          } 
          else if(qWallets[j].status == 'completed') {
            NFT.gganbu_history.push(gganbu);
          }
        }
      }
      

      return NFT;
    }
    catch(e) {
      console.log(e);
      return e;
    }
  },
  //trade instance 넣으면 colection / asset 정보 추가해 줌
  addTradeInfo: async (trade) => {
    try {
      //NFT 데이터 (name, imageURI)
      const qNFT = await NFTs.findOne({
        where: {
          contractAddress: trade.collectionAddress,
          token_ids: trade.token_ids
        }
      });
      trade.asset = {};
      if(qNFT) {
        trade.asset.name = qNFT.dataValues.name;
        trade.asset.imageURI = qNFT.dataValues.imageURI;
      }

      //collection 데이터 (name, symbol)
      const qCollection = await Collections.findOne({
        where: {
          contractAddress: trade.collectionAddress
        }
      });
      trade.collection = {};
      if(qCollection) {
        trade.collection.name = qCollection.dataValues.name;
        trade.collection.symbol = qCollection.dataValues.symbol;
      }

      return trade;
    } 
    catch (err) {
      return err;
    }
  },
  //gganbu instance 넣으면 정보 추가
  addGGanbuInfo: async (gganbu) => {
    try {
      //members 정보
      let qMembers = await GGanbu_members.findAll({
        where: {
          gganbuAddress: gganbu.gganbuAddress
        },
      });
      gganbu.members = qMembers;
      
      /*
      *suggestion 정보
      */
      gganbu.in_progress_suggestions = [];
      gganbu.suggestion_history = [];
      let qSuggestions = await Vote_suggestions.findAll({
        where: {
          orgAddress: gganbu.gganbuAddress
        },
      });
      for(let i=0;i<qSuggestions.length;i++) {
        let sug = qSuggestions[i].dataValues;
        //각 제안 별 투표 상태
        let qSubmits = await Vote_submits.findAll({
          where: {
            suggestion_id: qSuggestions[i].id
          },
        });
        sug.vote_info = qSubmits;

        if(sug.status == 'in progress') {
          gganbu.in_progress_suggestions.push(sug);
        } else {
          gganbu.suggestion_history.push(sug);
        }
      }


      //NFT 정보 (NFT 의 collection, trade 정보 추가)
      const qNFT = await NFTs.findOne({
        where: {
          contractAddress: gganbu.nft_collectionAddress,
          token_ids: gganbu.nft_token_ids
        }
      });


      let NFT = qNFT.dataValues;
      NFT = await utils.addNftInfo(NFT);
      
      gganbu.asset = NFT;
      if(gganbu.status == 'own') {
        gganbu.ratio_of_staking = 100;
      } else if(gganbu.status == 'recruit' && gganbu.asset.isSelling) {
        gganbu.ratio_of_staking = gganbu.balance / gganbu.asset.trade_selling.price * 100;
        gganbu.ratio_of_staking = Math.round(gganbu.ratio_of_staking * 100) / 100;  
      }
      //참여자 수, xx% 모집 완료
      gganbu.num_of_members = qMembers.length;

      return gganbu;
    } 
    catch (err) {
      console.log(err)
      return err;
    }
  },
  //dao instance 넣으면 정보 추가
  addDAOInfo: async (dao) => {
    try {
      //members 정보
      let qMembers = await DAO_members.findAll({
        where: {
          daoAddress: dao.daoAddress
        },
      });
      dao.members = qMembers;
      /*
      *suggestion 정보
      */
      //gganbu.hasSuggestion = false;
      //gganbu.suggestions = null;
      //gganbu.suggestion_history = [];

      //NFT 정보 (NFT 의 collection, trade 정보 추가)
      // const qNFT = await NFTs.findOne({
      //   where: {
      //     contractAddress: gganbu.nft_collectionAddress,
      //     token_ids: gganbu.nft_token_ids
      //   }
      // });
      // let NFT = null;
      // if(qNFT) {
      //   let NFT = qNFT.dataValues;
      //   NFT = await utils.addNftInfo(NFT);
      // }
      // gganbu.asset = NFT;

      //참여자 수, xx% 모집 완료
      dao.num_of_members = qMembers.length;
      // gganbu.ratio_of_staking = gganbu.balance / gganbu.asset.trade_selling.price * 100;
      // gganbu.ratio_of_staking = Math.round(gganbu.ratio_of_staking * 100) / 100;

      return dao;
    } 
    catch (err) {
      console.log(err)
      return err;
    }
  },
  //user address 넣으면 정보 추가
  addUserInfo: async (address) => {
    try {
      const user = await Users.findOne({ where: { address: address } });
  
      if (!user) {
        throw new Error("address가 일치하는 user가 없습니다");
      }
  
      //유저가 보유한 collection
      const myCollections = await Collections.findAll({
        where: {
          ownerAddress: address,
          is_created: true
        },
        order: [
          ['updatedAt', 'DESC']
        ],
      })
  
      let result = user.dataValues;
  
      //NFT 검색 옵션
      let whereOption_NFT = {
        ownerAddress: address,
        is_minted: true
      };
  
      //유저가 보유한 NFTs
      const myNFTs = await NFTs.findAll({
        where: whereOption_NFT,
        order: [
          ['updatedAt', 'DESC']
        ],
      });
  
      //유저가 보유한 rent NFTs
      const myRents = await Rents.findAll({
        where: { status: 'rent', renter: address },
        order: [
          ['updatedAt', 'DESC']
        ],
      });
  
      //컬랙션 수, 자산 수 추가
      result.num_of_collections = myCollections.length;
      result.num_of_assets = myNFTs.length;
      result.num_of_rents = myRents.length;
  
      //컬랙션 리스트 추가
      result.collections = [];
      for (let i = 0; i < myCollections.length; i++) {
        result.collections.push(myCollections[i].dataValues);
      }
      result.assets = myNFTs;
      result.rents = myRents;

      //유저가 가입한 깐부
      const qMyMembers = await GGanbu_members.findAll({
        where: {status:'active',memberAddress:address},
        order: [
          ['createdAt', 'DESC']
        ],
      });

      //내가 참여하고 있는 GGanbu 들
      result.gganbus = [];
      for(let i=0;i<qMyMembers.length;i++) {
        const qMyGGanbu = await GGanbu_wallets.findOne({
          where: {isActive:true,gganbuAddress:qMyMembers[i].dataValues.gganbuAddress}
        });
        if(qMyGGanbu) {
          test = await utils.addGGanbuInfo(qMyGGanbu);
          result.gganbus.push(test);
        }
      }

      return result;
    } 
    catch (err) {
      console.log(err)
      return err;
    }
  },
}

module.exports = utils;

const express = require('express');
const config = require('../config/config');
const hostURI = config.development.host_metadata;
const web3URI = config.development.web3_uri;
const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const web3 = new Web3(new Web3.providers.HttpProvider(web3URI));
const { sequelize, NFTs, Collections, Trades, Rents, Users, GGanbu_wallets, GGanbu_members, Vote_suggestions, Vote_submits } = require('../models');
const { Op, QueryTypes } = require("sequelize");
const router = express.Router();
const utils = require('./utils');

/*
 *  /suggestions
 *  모든 제안 리스트
 *  optional:
 *  ?tab=in-progress   <= 투표 중인
 *  ?user=<address> <= 내 꺼만
 */
router.get('/', async (req, res, next) => {
  let whereOption = {option:'gganbu'};
  //0x3a6a5D954f8480e430D09937B0c40cbeAbfC78d4
  if(req.query.tab) {
    if(req.query.tab == 'in-progress') {
      whereOption.status = 'in progress';
    }
  }

  try {
    let result = [];

    if(req.query.user) {
      //내가 참여하는 GGanbu 에 대해서만 qSuggestions 를 찾아야 한다.
      const qMyMembers = await GGanbu_members.findAll({
        where: {status:'active',memberAddress:req.query.user},
        order: [
          ['createdAt', 'DESC']
        ],
      });
      
      //내가 참여하고 있는 GGanbu 들
      for(let i=0;i<qMyMembers.length;i++) {
        const qMyGGanbus = await GGanbu_wallets.findOne({
          where: {isActive:true,gganbuAddress:qMyMembers[i].dataValues.gganbuAddress}
        });
        
        if(qMyGGanbus) {
          whereOption.orgAddress = qMyGGanbus.gganbuAddress;

          //내가 참여하는 각 깐부의 제안들
          const qSuggestions = await Vote_suggestions.findAll({
            where: whereOption,
            order: [
              ['createdAt', 'DESC']
            ],
          });
          
          for(let j=0;j<qSuggestions.length;j++) {
            //만약 내가 이미 투표한 제안이라면 제외
            let qMyVote = await Vote_submits.findOne({
              where: {
                suggestion_id: qSuggestions[j].id,
                memberAddress: req.query.user
              }
            });

            if(!qMyVote) {
              result.push(qSuggestions[j].dataValues);
            }
          }
        }
      }
    } else {
      const qSuggestions = await Vote_suggestions.findAll({
        where: whereOption,
        order: [
          ['createdAt', 'DESC']
        ],
      });
      result = qSuggestions.map(el => el.dataValues);
    }

    for (let i=0; i<result.length; i++) {
      //joiner 정보
      if(result[i].joiner != null && result[i].joiner != 0) {
        result[i].joiner_info = await utils.addUserInfo(result[i].joiner);
      }

      //투표 정보
      let qMembers = await GGanbu_members.findAll({
        where: {
          gganbuAddress: result[i].orgAddress,
          status: 'active'
        }
      })
      
      result[i].num_of_vote_members = qMembers.length;
      result[i].num_of_vote_submit = 0;
      result[i].num_of_vote_accept = 0;
      result[i].num_of_vote_reject = 0;
      result[i].vote_info = [];
      
      for(let j=0;j<qMembers.length;j++) {
        let voters = qMembers[j].dataValues;
        
        let qVote = await Vote_submits.findOne({
          where: {
            suggestion_id: result[i].id,
            memberAddress: voters.memberAddress
          }
        });

        if(qVote) {
          voters.vote_status = 'submitted'
          voters.vote_result = qVote.vote;
          voters.vote_submittedAt = qVote.createdAt;
          result[i].num_of_vote_submit++;

          if(voters.vote_result == false) {
            result[i].num_of_vote_reject++;
          }
          else {
            result[i].num_of_vote_accept++;
          }
        } 
        else {
          voters.vote_status = 'not submitted'
          voters.vote_result = null,
          voters.vote_submittedAt = null;
        }
        result[i].vote_info.push(voters);
      }
         

      //깐부 정보
      let qGGanbu = await GGanbu_wallets.findOne({
        where: {
          gganbuAddress: result[i].orgAddress
        },
      });
      result[i].gganbu = qGGanbu.dataValues;
      result[i].gganbu = await utils.addGGanbuInfo(result[i].gganbu);
    }

    res.json({ message: "ok", data: result });
  } catch (err) {
      console.error(err);
  }
});

/*
 *  /gganbus
 *  깐부 지갑데이터 생성
 *  required: userAddress, gganbuAddress, description
 *  optional: collectionAddress, token_ids
 */
router.post('/', async (req, res, next) => {
  try {
    console.log(`======== [POST] /ggangbu ========`);
    //입력 인자 가공
    if (!req.body.gganbuAddress || !req.body.description) {
      throw new SyntaxError("required: gganbuAddress, description");
    }

    //[required] nft_collectionAddress, nft_token_ids

    //[required] balance
    const balance = await web3.eth.getBalance(req.body.gganbuAddress);
    const iBalance = web3.utils.fromWei(balance, 'ether');

    //[required] 사용자 투자금, 사용자지분(ratio) 임시 staking_ratio 계산 (NFT타겟정보, 제안자eth)
    let qPrice = await Trades.findOne({ 
      where: {
        collectionAddress: req.body.collectionAddress,
        token_ids: req.body.token_ids
      },
    });
    let ratio = iBalance / Number(qPrice.price) * 100;
    ratio = Math.round(ratio * 100) / 100;

    //정규
    const reqData = {
      type: 'gganbu',
      gganbuAddress: req.body.gganbuAddress,
      description: req.body.description,
      nft_collectionAddress: req.body.collectionAddress, 
      nft_token_ids: req.body.token_ids,
      balance: iBalance,
      isActive: true,
      rewards : 0,
      status: 'recruit'
    };

    let qWallets = await GGanbu_wallets.findOrCreate({ 
      where: { gganbuAddress: req.body.gganbuAddress },
      defaults: reqData
    });

    const memberData = {
      memberAddress: req.body.userAddress,
      gganbuAddress: req.body.gganbuAddress,
      staking_value: iBalance,
      staking_ratio: ratio,
      my_rewards : 0,
      status: 'active'
    };

    let qMembers = await GGanbu_members.findOrCreate({ 
      where: { 
        gganbuAddress: req.body.gganbuAddress,
      },
      defaults: memberData
    });

    if (qWallets[1] === false || qMembers[1] === false) {
      if (qWallets[1] === false) {
        throw new Error('깐부 지갑주소가 이미 존재합니다');
      } else {
        throw new Error('해당 깐부지갑주소에 사용자가 이미 등록되어 있습니다');
      }
    }

    res.status(200).json({
      message: 'ok',
      data: null
    });
  } catch (err) {
    console.error(`에러 ${err}`);
    res.status(400).json({
        message: err.message,
        data: null
    });
  }
});

module.exports = router;
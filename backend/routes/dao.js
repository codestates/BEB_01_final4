const express = require('express');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const { sequelize, NFTs, Collections, Trades, Rents, Users, GGanbu_wallets, GGanbu_members, Vote_suggestions, Vote_submits, DAO_wallets, DAO_members } = require('../models');
const { Op, QueryTypes } = require("sequelize");
const router = express.Router();
const config = require('../config/config');
const hostURI = config.development.host_metadata;
const utils = require('./utils');

/*
 *  /gganbu
 *  모든 깐부 리스트
 *  optional:
 *  ?tab=operate        <= 운영 중인
 *  ?user=<address>     <= 내가 참여 중인
 *  ?tab=history        <= 종료된 내역
 */
router.get('/', async (req, res, next) => {
  let whereOption = {type:'dao'};
  if(req.query.tab) {
    if(req.query.tab == 'operate') {
      whereOption.status = req.query.tab;
    }
    else if(req.query.tab == 'history') {
      whereOption.isActive = false;
    }
  }

  try {
    let result = [];

    if(req.query.user) {
      //내가 참여하는 GGanbu
      const qMyMembers = await GGanbu_members.findAll({
        where: {status:'active',memberAddress:req.query.user},
        order: [
          ['createdAt', 'DESC']
        ],
      });

      //내가 참여하고 있는 GGanbu 들 정보
      for(let i=0;i<qMyMembers.length;i++) {
        if(req.query.user) {
          whereOption.gganbuAddress = qMyMembers[i].dataValues.gganbuAddress;
        }

        const qMyGGanbus = await GGanbu_wallets.findOne({
          where: whereOption,
        });
        if(qMyGGanbus) {
          result.push(qMyGGanbus.dataValues);
        }
      }
    } else {
      const qGGanbus = await GGanbu_wallets.findAll({
        where: whereOption,
        order: [
          ['createdAt', 'DESC']
        ],
      });
      result = qGGanbus.map(el => el.dataValues);
    }
    console.log(result);   

    for (let i = 0; i < result.length; i++) {
      result[i] = await utils.addDaoInfo(result[i]);
    }

    res.json({ message: "ok", data: result });
  } catch (err) {
      console.error(err);
  }
});

/*
 *  /dao
 *  DAO 지갑데이터 생성
 *  required: userAddress, gganbuAddress, name, description
 *  optional: collectionAddress, token_ids
 */
router.post('/', async (req, res, next) => {
  try {
    console.log(`======== [POST] /dao ========`);
    //입력 인자 가공
    if (!req.body.gganbuAddress || !req.body.description || !req.body.name) {
      throw new SyntaxError("required: gganbuAddress, description, name");
    }

    //[required] nft_collectionAddress, nft_token_ids

    //[required] balance
    const balance = await web3.eth.getBalance(req.body.gganbuAddress);
    const iBalance = web3.utils.fromWei(balance, 'ether');
    const iRatio = 0;
    if(iBalance != 0) {
      iRatio = 100;
    }

    //정규
    const reqData = {
      type: 'dao',
      gganbuAddress: req.body.gganbuAddress,
      description: req.body.description,
      nft_collectionAddress: null,
      nft_token_ids: null,
      balance: iBalance,
      isActive: true,
      rewards : 0,
      status: 'operate'
    };

    let qWallets = await GGanbu_wallets.findOrCreate({ 
      where: { gganbuAddress: req.body.gganbuAddress },
      defaults: reqData
    });

    const memberData = {
      memberAddress: req.body.userAddress,
      gganbuAddress: req.body.gganbuAddress,
      staking_value: iBalance,
      staking_ratio: iRatio,
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
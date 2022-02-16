const express = require('express');
const config = require('../config/config');
const hostURI = config.development.host_metadata;
const web3URI = config.development.web3_uri;
const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const web3 = new Web3(new Web3.providers.HttpProvider(web3URI));
const { sequelize, NFTs, Collections, Trades, Rents, Users, GGanbu_wallets, GGanbu_members, Vote_suggestions, Vote_submits, DAO_wallets, DAO_members } = require('../models');
const { Op, QueryTypes } = require("sequelize");
const router = express.Router();
const utils = require('./utils');

/*
 *  /dao
 *  리스트
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
      //내가 참여하는 dao
      const qMyMembers = await DAO_members.findAll({
        where: {status:'active',memberAddress:req.query.user},
        order: [
          ['createdAt', 'DESC']
        ],
      });

      //내가 참여하고 있는 DAO 들 정보
      for(let i=0;i<qMyMembers.length;i++) {
        if(req.query.user) {
          whereOption.daoAddress = qMyMembers[i].dataValues.daoAddress;
        }

        const qMyGGanbus = await DAO_wallets.findOne({
          where: whereOption,
        });
        if(qMyGGanbus) {
          result.push(qMyGGanbus.dataValues);
        }
      }
    } else {
      const qGGanbus = await DAO_wallets.findAll({
        where: whereOption,
        order: [
          ['createdAt', 'DESC']
        ],
      });
      result = qGGanbus.map(el => el.dataValues);
    }
    console.log(result);   

    for (let i = 0; i < result.length; i++) {
      result[i] = await utils.addDAOInfo(result[i]);
    }

    res.json({ message: "ok", data: result });
  } catch (err) {
      console.error(err);
  }
});

/*
 *  /dao
 *  DAO 지갑데이터 생성
 *  required: userAddress, daoAddress, name, description
 *  optional: collectionAddress, token_ids
 */
router.post('/', async (req, res, next) => {
  try {
    console.log(`======== [POST] /dao ========`);
    //입력 인자 가공
    if (!req.body.daoAddress || !req.body.description || !req.body.name) {
      throw new SyntaxError("required: daoAddress, description, name");
    }

    //[required] nft_collectionAddress, nft_token_ids

    //[required] balance
    const balance = await web3.eth.getBalance(req.body.daoAddress);
    const iBalance = web3.utils.fromWei(balance, 'ether');
    let iRatio = 0;
    if(iBalance != 0) {
      iRatio = 100;
    }

    //정규
    const reqData = {
      type: 'dao',
      daoAddress: req.body.daoAddress,
      name: req.body.name,
      description: req.body.description,
      balance: iBalance,
      isActive: true,
      rewards : 0,
      status: 'operate'
    };

    let qWallets = await DAO_wallets.findOrCreate({ 
      where: { daoAddress: req.body.daoAddress },
      defaults: reqData
    });
    console.log(qWallets);
    console.log(`지갑 생성 완료`);

    const memberData = {
      memberAddress: req.body.userAddress,
      daoAddress: req.body.daoAddress,
      staking_value: iBalance,
      staking_ratio: iRatio,
      my_rewards : 0,
      status: 'active'
    };

    let qMembers = await DAO_members.findOrCreate({ 
      where: { 
        daoAddress: req.body.daoAddress,
      },
      defaults: memberData
    });
    console.log(qWallets);
    console.log(`사용자 생성 완료`);

    if (qWallets[1] === false || qMembers[1] === false) {
      if (qWallets[1] === false) {
        throw new Error('DAO 지갑주소가 이미 존재합니다');
      } else {
        throw new Error('해당 DAO지갑주소에 사용자가 이미 등록되어 있습니다');
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


/*
 *  /dao/<address>
 *  DAO 상세 페이지
 */
router.get('/:daoAddress', async (req, res, next) => {
  try {
    console.log(`======== [GET] /dao/${req.params.daoAddress} ========`);
    const iDAOAddress = req.params.daoAddress;
    let result = {};

    const qDAOs = await DAO_wallets.findOne({
      where: {daoAddress:iDAOAddress}
    });

    if(qDAOs) {
      result = await utils.addDAOInfo(qDAOs.dataValues);
    } else {
      throw Error('DAO 지갑이 존재하지 않습니다');
    }
    res.json({ message: "ok", data: result });
  } catch (err) {
      console.error(err);
  }
});


module.exports = router;
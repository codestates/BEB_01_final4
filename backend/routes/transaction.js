const express = require('express');
const config = require('../config/config');
const web3URI = config.development.web3_uri;
const Web3 = require('web3');
//const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const web3 = new Web3(new Web3.providers.HttpProvider(web3URI));
const { sequelize, NFTs, Collections, Trades, Rents, Users, GGanbu_wallets, GGanbu_members, Vote_suggestions, Vote_submits, DAO_wallets, DAO_members } = require('../models');
const { Op, QueryTypes } = require("sequelize");
const router = express.Router();
const utils = require('./utils');
const updateTx = require('../daemon/daemon_klaytn');

/*
 *  /transaction
 */
router.post('/', async (req, res, next) => {
  try {
    //입력 인자 가공
    if (!req.body.transaction || !req.body.networkType) {
      throw new SyntaxError("required: transaction, networkType");
    }
    console.log(`======== [POST] /transaction : ${req.body.transaction} ========`);
    
    updateTx(req.body.transaction);    

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
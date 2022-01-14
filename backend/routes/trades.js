const express = require('express');
const { NFTs, Collections, Trades, Users } = require('../models');
const { Op } = require("sequelize");
const router = express.Router();
const config = require('../config/config');
const hostURI = config.development.host_metadata;

//trade instance 넣으면 colection / asset 정보 추가해 줌
const addTradeInfo = async (trade) => {
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
}

/*
 *  /trades
 *  All Trades List
 *  optional: none
 */
router.get('/', async (req, res, next) => {
  try {
    let result = [];

    const qTrades = await Trades.findAll({
      order: [
        ['id', 'DESC'],
      ],
    });

    //존재한다면
    if (qTrades.length > 0) {
      for(let i=0;i<qTrades.length;i++) {
        let trade = qTrades[i].dataValues;
        trade = await addTradeInfo(trade);

        //트레이드 데이터
        result.push(trade);
      }


      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("trade가 존재하지 않음");
    }
  } catch (err) {
    console.error(`에러 ${err}`);
    res.status(400).json({
      message: err.message,
      data: null
    });
  }
});

/*
 *  /trades/selling
 *  모든 NFTs 판매 중
 *  optional: 
 *  ?sort=price-high    => 높은 가격 순
 */
router.get('/selling', async (req, res, next) => {
  //sort 옵션
  let orderOption = [['id', 'DESC']];
  if(req.query.sort) {
    orderOption = [['price', 'DESC']];
  }

  try {
    let result = [];

    const qTrades = await Trades.findAll({
      where: {status: 'selling'},
      order: orderOption
    });

    //존재한다면
    if (qTrades.length > 0) {
      for(let i=0;i<qTrades.length;i++) {
        let trade = qTrades[i].dataValues;
        trade = await addTradeInfo(trade);

        //트레이드 데이터
        result.push(trade);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("판매 중인 trade 가 존재하지 않음");
    }
  } catch (err) {
    console.error(`에러 ${err}`);
    res.status(400).json({
      message: err.message,
      data: null
    });
  }
});

/*
 *  /trades/history
 *  모든 NFTs 거래완료 내역
 *  optional: 
 *  ?sort=price-high    => 높은 가격 순
 */
router.get('/history', async (req, res, next) => {
  //sort 옵션
  let orderOption = [['id', 'DESC']];
  if(req.query.sort) {
    orderOption = [['price', 'DESC']];
  }

  try {
    let result = [];

    const qTrades = await Trades.findAll({
      where: {status: 'completed'},
      order: orderOption
    });

    //존재한다면
    if (qTrades.length > 0) {
      for(let i=0;i<qTrades.length;i++) {
        let trade = qTrades[i].dataValues;
        trade = await addTradeInfo(trade);

        //트레이드 데이터
        result.push(trade);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("거래 완료된 trade 가 존재하지 않음");
    }
  } catch (err) {
    console.error(`에러 ${err}`);
    res.status(400).json({
      message: err.message,
      data: null
    });
  }
});



module.exports = router;
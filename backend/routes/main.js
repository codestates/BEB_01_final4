const express = require('express');
const { NFTs, Collections, Trades, Users, sequelize } = require('../models');
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
    if (qNFT) {
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
    if (qCollection) {
      trade.collection.name = qCollection.dataValues.name;
      trade.collection.symbol = qCollection.dataValues.symbol;
    }

    return trade;
  }
  catch (err) {
    return err;
  }
}

// 최근 생성된 NFT 최대 5개
router.get('/recentNFTs', async (req, res, next) => {
  try {
    const recentNFT = await NFTs.findAll({
      where: {
        is_minted: true
      },
      order: [
        ['id', 'DESC'],
      ],
      limit: 5,
    });
    if (recentNFT) {
      res.status(200).json({ message: "ok", data: recentNFT })
    }

  } catch (err) {
    res.status(400).json({
      message: err.message,
      data: null
    });
  }
});

// 최근 Selling Trades 5개 
// ?sort=price-high: 높은 가격 순
// ?status=complete: 완료된 거래만 조회 
router.get('/trades', async (req, res, next) => {
  //sort 옵션
  let orderOption = [['id', 'DESC']];
  let statusOption = 'selling'
  if (req.query.sort) {
    orderOption = [['price', 'DE회C']];
  }
  if (req.query.status) {
    statusOption = "completed"
  }

  try {
    let result = [];

    const qTrades = await Trades.findAll({
      where: { status: statusOption },
      order: orderOption,
      limit: 5,
    });

    //존재한다면
    if (qTrades.length > 0) {
      for (let i = 0; i < qTrades.length; i++) {
        let trade = qTrades[i].dataValues;
        trade = await addTradeInfo(trade);
        result.push(trade);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
      throw new Error("판매 중인 trade가 존재하지 않음");
    }
  } catch (err) {
    console.error(`에러 ${err}`);
    res.status(400).json({
      message: err.message,
      data: null
    });
  }
});


// 가장 많은 NFT 보유 회원 Top5
router.get('/topUser', async (req, res, next) => {
  try {
    const topUser = await NFTs.findAll({
      group: 'ownerAddress',
      attributes: ['ownerAddress', [sequelize.fn('COUNT', 'ownerAddress'), 'count']],
      order: [
        [sequelize.literal('COUNT(ownerAddress)'), 'DESC'],
      ],
      limit: 5,
    })
    if (topUser) {
      res.status(200).json({
        message: 'ok',
        data: topUser
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
      data: null
    })
  }
});



// 판매 중인 가장 비싼 NFT 5개
// router.get('/sellingTopNFTs', async (req, res, next) => {
//   try {
//     const sellingTopNFTs = await Trades.findAll({
//       where: {
//         status: 'selling'
//       },
//       order: [
//         ['price', 'DESC'],
//       ],
//       limit: 5,
//     })
//     if (sellingTopNFTs) {
//       res.status(200).json({
//         message: "ok",
//         data: sellingTopNFTs
//       })
//     }

//   } catch (err) {
//     res.status(400).json({
//       message: err.message,
//       data: null
//     })
//   }
// })

module.exports = router;
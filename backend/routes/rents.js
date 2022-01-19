const express = require('express');
const { NFTs, Collections, Trades, Rents, Users } = require('../models');
const { Op } = require("sequelize");
const router = express.Router();
const config = require('../config/config');
const hostURI = config.development.host_metadata;

//rent instance 넣으면 colection / asset 정보 추가해 줌
const addRentInfo = async (rent) => {
  try {
    const qNFT = await NFTs.findOne({
      where: {
        contractAddress: rent.collectionAddress,
        token_ids: rent.token_ids
      }
    });
    rent.asset = {};
    if(qNFT) {
      rent.asset.name = qNFT.dataValues.name;
      rent.asset.imageURI = qNFT.dataValues.imageURI;
    }

    //collection 데이터 (name, symbol)
    const qCollection = await Collections.findOne({
      where: {
        contractAddress: rent.collectionAddress
      }
    });
    rent.collection = {};
    if(qCollection) {
      rent.collection.name = qCollection.dataValues.name;
      rent.collection.symbol = qCollection.dataValues.symbol;
    }

    return rent;
  } 
  catch (err) {
    return err;
  }
}

/*
 *  /rents
 *  All Rents List
 *  optional: none
 */
router.get('/', async (req, res, next) => {
  try {
    let result = [];

    const qRents = await Rents.findAll({
      order: [
        ['id', 'DESC'],
      ],
    });

    //존재한다면
    if (qRents.length > 0) {
      for(let i=0;i<qRents.length;i++) {
        let rent = qRents[i].dataValues;
        rent = await addRentInfo(rent);

        //트레이드 데이터
        result.push(rent);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("rent 가 존재하지 않음");
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
 *  /rents/lend
 *  대여 등록된 모든 NFTs
 *  optional: 
 *  ?sort=price-high    => 높은 가격 순
 */
router.get('/lend', async (req, res, next) => {
  //sort 옵션
  let orderOption = [['id', 'DESC']];
  if(req.query.sort) {
    orderOption = [['price', 'DESC']];
  }

  try {
    let result = [];

    const qRents = await Rents.findAll({
      where: {status: 'lend'},
      order: orderOption
    });

    //존재한다면
    if (qRents.length > 0) {
      for(let i=0;i<qRents.length;i++) {
        let rent = qRents[i].dataValues;
        rent = await addRentInfo(rent);

        //트레이드 데이터
        result.push(rent);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("대여 등록된(lend) NFT 가 존재하지 않음");
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
 *  /rents/rent
 *  대여 중인 모든 NFTs
 *  optional: 
 *  ?sort=price-high    => 높은 가격 순
 */
router.get('/rent', async (req, res, next) => {
  //sort 옵션
  let orderOption = [['id', 'DESC']];
  if(req.query.sort) {
    orderOption = [['price', 'DESC']];
  }

  try {
    let result = [];

    const qRents = await Rents.findAll({
      where: {status: 'rent'},
      order: orderOption
    });

    //존재한다면
    if (qRents.length > 0) {
      for(let i=0;i<qRents.length;i++) {
        let rent = qRents[i].dataValues;
        rent = await addRentInfo(rent);

        //트레이드 데이터
        result.push(rent);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("대여 중인(rent) NFT 가 존재하지 않음");
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
 *  /rents/history
 *  모든 NFTs rent 거래완료 내역
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

    const qRents = await Rents.findAll({
      where: {status: 'completed'},
      order: orderOption
    });

    //존재한다면
    if (qRents.length > 0) {
      for(let i=0;i<qRents.length;i++) {
        let rent = qRents[i].dataValues;
        rent = await addRentInfo(rent);

        //트레이드 데이터
        result.push(rent);
      }

      res.status(200).json({
        message: 'ok',
        data: result
      });
    } else {
        throw new Error("rent 임대가 종료된 NFT 가 존재하지 않음");
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
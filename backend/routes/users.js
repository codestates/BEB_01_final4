const express = require('express');
const { Users, Collections, NFTs, Trades, Rents } = require('../models');
const { Op } = require("sequelize");
const collections = require('../models/collections');
const router = express.Router();

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
 *  /users/<address>
 *  마이 페이지 (유저정보 + 보유 collections + 보유 assets)
 *  required: address
 *  options:
 *  [my NFTs mint한] /users/<id>?tab=mint
 *  [my NFTs 판매 중] /users/<id>?tab=selling
 *  [my NFTs 거래완료 내역] /users/<id>?tab=history
 *  [my NFTs 거래취소 내역] /users/<id>?tab=cancelled
 */
router.get('/:address', async (req, res, next) => {
  try {
    console.log(req.params.address);
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
      throw new Error("address가 일치하는 user가 없습니다");
    }

    //유저가 보유한 collection
    const myCollections = await Collections.findAll({ 
      where: { 
        ownerAddress: address,
        is_created : true
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })

    let result = user.dataValues;
    
    //NFT 검색 옵션
    let whereOption_NFT = {
      ownerAddress: address,
      is_minted: true
    };
    if(req.query.tab == 'mint') {
        whereOption_NFT.creatorAddress = address
    }

    //유저가 보유한 NFTs
    const myNFTs = await NFTs.findAll({ 
      where: whereOption_NFT,
      order: [
        ['createdAt', 'DESC']
      ],
    });

    //유저가 보유한 rent NFTs
    const myRents = await Rents.findAll({ 
      where: {status:'rent',renter:address},
      order: [
        ['createdAt', 'DESC']
      ],
    });
    
    //컬랙션 수, 자산 수 추가
    result.num_of_collections = myCollections.length;
    result.num_of_assets = myNFTs.length;
    result.num_of_rents = myRents.length;

    //컬랙션 리스트 추가
    result.collections = [];
    for(let i=0;i<myCollections.length;i++) {
      result.collections.push(myCollections[i].dataValues);
    }

    // case 보유 NFT: /users/<id>, /users/<id>?tab=mint, /users/<id>?tab=selling
    if(!req.query.tab || req.query.tab == 'mint' || req.query.tab == 'selling'
        || req.query.tab == 'lend') 
    {
      result.assets = [];
      
      for(let i=0;i<myNFTs.length;i++) {
        //NFT 가 판매 중이라면 판매 정보 업데이트
        let NFT = myNFTs[i].dataValues;

        //각 NFT의 collection 데이터
        const nftCollection = await Collections.findOne({
          where: {
            contractAddress: NFT.contractAddress
          }
        });
        if(nftCollection) {
          NFT.collection = nftCollection.dataValues;
        }

        NFT.isSelling = false;
        NFT.price = null;
        NFT.trade_ca = null;
        NFT.seller = null;
        NFT.trade_selling = null;
        NFT.isLending = false;
        NFT.lending = null;
        NFT.isRenting = false;
        NFT.renting = null;
        
        //trade sort 옵션
        let whereOption = {
            token_ids : NFT.token_ids,
            collectionAddress : NFT.contractAddress,
            status : 'selling'
        };

        //트레이드 정보 추가
        // let qTrades = await Trades.findAll({
        //     where: whereOption,
        //     //order: orderOption
        // });
        
        //만약 Trade 내역이 존재한다면 NFT 에 그 내역들을 추가
        // if(qTrades.length > 0) {
        //     for (let j = 0; j < qTrades.length; j++) {
        //         //selling 중인 trade 가 있다면
        //         if(qTrades[j].status == 'selling') {
        //             NFT.isSelling = true;
        //             NFT.price = qTrades[j].price;
        //             NFT.trade_ca = qTrades[j].trade_ca;
        //             NFT.seller = qTrades[j].seller;
        //             NFT.trade_selling = qTrades[j].dataValues;
        //             //NFT.trade_history.push(qTrades[j].dataValues);
        //         }
        //     }
        // }

        //트레이드 정보 추가
        let qTrades = await Trades.findOne({
            where: whereOption,
        });
        
        //만약 Trade 내역이 존재한다면 NFT 에 그 내역들을 추가
        if(qTrades) {
          NFT.isSelling = true;
          NFT.price = qTrades.price;
          NFT.trade_ca = qTrades.trade_ca;
          NFT.seller = qTrades.seller;
          NFT.trade_selling = qTrades.dataValues; 
        }

        //대여 정보 추가
        let qRent = await Rents.findOne({
          where: {
            token_ids: NFT.token_ids,
            collectionAddress: NFT.contractAddress,
            [Op.or]: [{ status: 'lend' }, { status: 'rent' }],
          },
        });
        
        if(qRent) {
          if(qRent.status == 'lend') {
            NFT.isLending = true;
            NFT.price = qRent.price;
            NFT.seller = qRent.owner;
            NFT.lending = qRent.dataValues;
          }
          //본인이 보유하고 있는 NFT 중 본인이 rent 하고 있는 건 존재하지 않는다
          else if(qRent.status == 'rent') {
            NFT.isRenting = true;
            NFT.price = qRent.price;
            NFT.seller = qRent.owner;
            NFT.renting = qRent.dataValues;
          }
        }

        //제공할 NFT 선택
        if(req.query.tab == 'selling' && NFT.isSelling == true) {
            // 모든 NFT 제공
            result.assets.push(NFT);
        } else if(!req.query.tab || req.query.tab == 'mint') {
            result.assets.push(NFT);
        } else if(req.query.tab == 'lend' && NFT.isLending == true) {
          result.assets.push(NFT);
        }
      }
      //sort
      result.assets = result.assets.sort((a, b) => a.isSelling > b.isSelling ? -1 : 1);

      if(req.query.sort == 'price-high') {
        result.assets = result.assets.sort(function(a, b)  {
          return b.price - a.price;
        });
      }
    } else if(req.query.tab == 'history' || req.query.tab == 'cancelled') {
      result.trades = [];
      
      //sort 옵션
      let orderOption = [['id', 'DESC']];
      if(req.query.sort) {
        orderOption = [['price', 'DESC']];
      }
      let whereStatusOption;
      if(req.query.tab == 'history') {
        whereStatusOption = 'completed';
      } else if(req.query.tab == 'cancelled') {
        whereStatusOption = 'cancelled';
      }

      const qTrades = await Trades.findAll({
        where: {
          status: whereStatusOption,
          [Op.or]: [{ seller: address }, { buyer: address }],
        },
        order: orderOption
      });
  
      //존재한다면
      if (qTrades.length > 0) {
        for(let i=0;i<qTrades.length;i++) {
          let trade = qTrades[i].dataValues;
          trade = await addTradeInfo(trade);
  
          //트레이드 데이터
          result.trades.push(trade);
        }
      }
    } else if(req.query.tab == 'rent') {
      //NFT리스트 취합
      let rentNFTs = [];
      for(let i=0;i<myRents.length;i++) {
        const targetNFT = await NFTs.findOne({ 
          where: {
            contractAddress: myRents[i].collectionAddress,
            token_ids: myRents[i].token_ids
          }
        });
        rentNFTs.push(targetNFT.dataValues);
      }
      
      result.assets = [];
      
      for(let i=0;i<rentNFTs.length;i++) {
        //NFT 가 판매 중이라면 판매 정보 업데이트
        let NFT = rentNFTs[i];
        
        //각 NFT의 collection 데이터
        const nftCollection = await Collections.findOne({
          where: {
            contractAddress: NFT.contractAddress
          }
        });
        if(nftCollection) {
          NFT.collection = nftCollection.dataValues;
        }
        console.log('여기?22222');
        NFT.isSelling = false;
        NFT.price = null;
        NFT.trade_ca = null;
        NFT.seller = null;
        NFT.trade_selling = null;
        NFT.isLending = false;
        NFT.lending = null;
        NFT.isRenting = false;
        NFT.renting = null;
        
        //trade sort 옵션
        let whereOption = {
            token_ids : NFT.token_ids,
            collectionAddress : NFT.contractAddress,
            status : 'selling'
        };

        //트레이드 정보 추가
        let qTrades = await Trades.findOne({
            where: whereOption,
        });
        
        //만약 Trade 내역이 존재한다면 NFT 에 그 내역들을 추가
        if(qTrades) {
          NFT.isSelling = true;
          NFT.price = qTrades.price;
          NFT.trade_ca = qTrades.trade_ca;
          NFT.seller = qTrades.seller;
          NFT.trade_selling = qTrades.dataValues; 
        }

        //대여 정보 추가
        let qRent = await Rents.findOne({
          where: {
            token_ids: NFT.token_ids,
            collectionAddress: NFT.contractAddress,
            status: 'rent',
          },
        });
        if(qRent) {
          NFT.isRenting = true;
          NFT.price = qRent.price;
          NFT.seller = qRent.owner;
          NFT.renting = qRent.dataValues;
        }

        result.assets.push(NFT);
      }
      //sort
      result.assets = result.assets.sort((a, b) => a.isSelling > b.isSelling ? -1 : 1);

      if(req.query.sort == 'price-high') {
        result.assets = result.assets.sort(function(a, b)  {
          return b.price - a.price;
        });
      }
    } else if(req.query.tab == 'rent-history') {
      result.rents = [];

      //sort 옵션
      let orderOption = [['id', 'DESC']];
      if(req.query.sort) {
        orderOption = [['price', 'DESC']];
      }

      const qRents = await Rents.findAll({
        where: {
          status: 'completed',
          [Op.or]: [{ owner: address }, { renter: address }],
        },
        order: orderOption
      });
  
      //존재한다면
      if (qRents.length > 0) {
        for(let i=0;i<qRents.length;i++) {
          let rent = qRents[i].dataValues;
          rent = await addRentInfo(rent);
  
          //트레이드 데이터
          result.rents.push(rent);
        }
      }
    }

    res.status(200).json({ message: "ok", data: result });
  } catch (err) {
    console.log(`에러 ${err}`);
    res.status(400).json({
        message: err.message,
        data: null
    });
  }
});

// 내 보유 컬렉션
router.get('/:address/collections', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }
    const myCollections = await Collections.findAll({ 
      where: { 
        ownerAddress: address,
        is_created : true
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })

    console.log(myCollections);
    res.status(200).json({ message: "ok", data: myCollections });
});

// 내 보유 NFTs
router.get('/:address/assets', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }
    const myNFTs = await NFTs.findAll({ 
      where: { 
        ownerAddress: address,
        is_minted: true
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })
    res.status(200).json({ message: "ok", data: myNFTs });
});

// 정보 수정 name, imageURL, email
router.post('/:address', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }

    const body = {
        address: address,
        name: req.body.name || user.name,
        imageURL: req.body.imageURL || user.imageURL,
        email: req.body.email || user.email,
    }

    await Users.update(body, { where: { address: address } })
        .then(result => {
            console.log("DB 수정 완료");
            res.status(200).json({ message: "ok", data: body });
        })
        .catch(err => {
            console.log(err);
            res.json({ message: "false" });
        })
});

/*
 *  /users
 *  로그인 or 사용자 생성
 *  required: address 필수
 */
router.post('/', async (req, res, next) => { // User: address, imageURL, name, email
    if (!req.body.address) {
        res.status(400).json({ message: "address 입력이 없습니다" });
        return;
    }

    const isExistAddress = await Users.findOne({ where: { address: req.body.address } });
    if (isExistAddress) {
        res.status(200).json({ 
            message: "login",
            data: {}
        });
        return;
    }

    const newUser = {
        address: req.body.address,
        //imageURL: req.body.imageURL,
        //name: req.body.name,
        //email: req.body.email,
    }
    Users.create(newUser)
        .then(result => {
            console.log('DB 저장 완료');
            res.status(200).json({ 
                message: "new user",
                data: newUser 
            });
        })
        .catch(err => {
            console.log(err);
            res.json({ message: "false" });
        })

})

module.exports = router;
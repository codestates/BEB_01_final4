const express = require('express');
const { NFTs, Collections, Trades, Rents, Users } = require('../models');
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

// 공백이 있나 없나 체크 
function hasSpace(str) {
    if (str.search(/\s/) != -1) {
        return true;
    } else {
        return false;
    }
}

// 특수 문자가 있나 없나 체크 
function hasSpecial(str) {
    const special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if (special_pattern.test(str) == true) {
        return true;
    } else {
        return false;
    }
}

// 대문자 포함 여부
function hasUpperCase(str) {
    if (str.toLowerCase() !== str) {
        return true;
    } else {
        return false;
    }
}


/*
 *  /collections
 *  All Collections List
 *  optional: 
 *  [컬랙션명으로 조건 검색] ?search=
 *  [컬랙션명으로 조건 검색, 단 컬랙션명만 추출] ?searchname=
 */
router.get('/', async (req, res, next) => {
    try {
        //쿼리 옵션
        let options = {
            is_created: true
        };
        let attr;

        //검색
        if (req.query.search) {
            // LIKE '%특정 문자열%';
            options.symbol = { [Op.like]: `%${req.query.search}%` }
        }

        //컬랙션명만 검색
        if (req.query.searchname) {
            options.symbol = { [Op.like]: `%${req.query.searchname}%` }
            attr = ['name', 'symbol'];
        }

        const allCollections = await Collections.findAll({
            where: options,
            order: [
              ['createdAt', 'DESC']
            ],
            attributes: attr
        });

        res.json({ message: "ok", data: allCollections });
    } catch (err) {
        console.error(err);
    }
});

/*
 *  /collection
 *  컬랙션 생성 (metadata 정보 회신)
 *  required: ownerAddress, name, symbol, description, image_url, banner_url
 */
router.post('/', async (req, res, next) => {
    try {
        console.log(`======== [POST] /collection ========`);
        //입력 인자 가공
        if (!req.body.ownerAddress || !req.body.name ||
            !req.body.symbol || !req.body.description ||
            !req.body.image_url || !req.body.banner_url) {
            throw new SyntaxError("required: ownerAddress, name, symbol, description, image_url, banner_url");
        }

        // symbol 은 '소문자 + dash' 조합만 가능
        let reqSymbol = req.body.symbol;
        if (hasSpace(reqSymbol) || hasSpecial(reqSymbol) || hasUpperCase(reqSymbol)) {
            throw new Error('symbol 은 소문자 + dash 조합만 가능합니다');
        }

        const reqData = {
            is_created: false,
            ownerAddress: req.body.ownerAddress,
            name: req.body.name,
            symbol: reqSymbol,
            description: req.body.description,
            image_url: req.body.image_url,
            banner_url: req.body.banner_url,
        };

        let qRes = await Collections.findOrCreate({ where: { symbol: reqData.symbol }, defaults: reqData });
        if (qRes[1] === false) {
            console.log('컬랙션 symbol 이 이미 존재합니다');
            res.status(409).json({
                message: '컬랙션 symbol 이 이미 존재합니다',
                data: null
            });
        } else {
            let collectionURI = `${hostURI}/metadata/collection/${qRes[0].dataValues.id}`;
            console.log(`collectionURI 가 생성됨 : ${collectionURI}`);
            res.status(200).json({
                message: 'ok',
                data: {
                    collectionURI
                }
            });
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
 *  /collections/<collection>
 *  컬랙션 생성 후 CA 저장
 *  required: contractAddress
 */
router.post('/:collection_symbol', async (req, res, next) => {
    try {
        console.log(`======== [POST] /collection/<collection> ========`);
        console.log(req.params.collection_symbol);
        //입력 인자 가공
        if (!req.body.contractAddress) {
            throw new SyntaxError("required: contractAddress");
        }

        let reqData = {
            contractAddress: req.body.contractAddress,
            is_created: true
        }

        // DB 업데이트
        let qRes = await Collections.update(reqData,
            { where: { symbol: req.params.collection_symbol } }
        );
        console.log(qRes);

        if (qRes[0] === 1) {
            res.status(200).json({
                message: '업데이트 완료',
                data: {
                    collectionAddress: req.body.contractAddress
                }
            });
        } else {
            throw new Error("해당 symbol 을 가진 collection 이 존재하지 않음");
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
 *  /collections/<collection>
 *  컬랙션 조회 (+ 컬랙션에 소속된 NFTs 포함)
 *  required: none
 *  option:
 *  ?tab=selling        <= 판매 중만
 *  ?tab=history        <= 거래 내역만
 *  ?sort=price-high    <= 정렬 옵션
 */
router.get('/:collection_symbol', async (req, res, next) => {
  try {
    console.log(`======== [GET] /collection/${req.params.collection_symbol} ========`);
    //입력 인자 가공
    reqSymbol = req.params.collection_symbol;

    //컬랙션 조회
    let qCollection = await Collections.findOne({
        where: {
            symbol: reqSymbol,
            is_created: true
        }
    });
    let result = qCollection.dataValues;
    
    //컬랙션에 소속된 NFTs
    let qNFTs = await NFTs.findAll({
        where: {
          contractAddress: qCollection.contractAddress,
          is_minted: true
        },
        order: [
          ['createdAt', 'DESC']
        ]
    });
    result.number_of_assets = qNFTs.length;
    
    // case 보유 NFT: /collection/<coln>, /collection/<coln>?tab=selling
    if(!req.query.tab || req.query.tab == 'selling' || req.query.tab == 'lend' || req.query.tab == 'rent') {
      result.assets = [];
    
      for (let i = 0; i < qNFTs.length; i++) {
        let NFT = qNFTs[i].dataValues;

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
        //NFT.trade_history = null;
        //NFT.trade_cancelled = null;

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
        } 
        else if(!req.query.tab || req.query.tab == 'mint') {
            result.assets.push(NFT);
        } 
        else if(req.query.tab == 'lend' && NFT.isLending == true) {
          result.assets.push(NFT);
        }
        else if(req.query.tab == 'rent' && NFT.isRenting == true) {
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
    } else if(req.query.tab == 'history') {
      result.trades = [];

      //sort 옵션
      let orderOption = [['id', 'DESC']];
      if(req.query.sort == 'price-high') {
        orderOption = [['price', 'DESC']];
      }

      const qTrades = await Trades.findAll({
        where: {
          status: 'completed',
          collectionAddress: qCollection.contractAddress
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
    }

    //console.log(result);
    // owners 
    /*
    에러 SequelizeDatabaseError: Expression #1 of SELECT list is not in GROUP BY clause and contains nonaggregated column
    위와 같은 오류가 난다면 mysql에서 아래 명령어를 입력

    SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

    */
    console.log(qCollection.contractAddress)
    const owners = await NFTs.findAll({
        where: {
            contractAddress: qCollection.contractAddress
        },
        group: 'ownerAddress',
        attributes: ['ownerAddress']
    });
    result.number_of_owners = owners.length;
    console.log(owners);

    if (qCollection) {
        res.status(200).json({
            message: 'ok',
            data: result
        });
    } else {
        throw new Error("해당 symbol 을 가진 collection 이 존재하지 않음");
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
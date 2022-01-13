const express = require('express');
const { NFTs, Collections, Trades, Users } = require('../models');
const { Op } = require("sequelize");
const router = express.Router();
const config = require('../config/config');
const hostURI = config.development.host_metadata;

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
            is_created:true
        };
        let attr;

        //검색
        if(req.query.search) {
            // LIKE '%특정 문자열%';
            options.symbol = {[Op.like]: `%${req.query.search}%`}
        }

        //컬랙션명만 검색
        if(req.query.searchname) {
            options.symbol = {[Op.like]: `%${req.query.searchname}%`}
            attr = ['name', 'symbol'];
        }

        const allCollections = await Collections.findAll({
            where: options,
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
 *  required:
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
        result.assets = [];

        //컬랙션에 소속된 NFTs
        let qNFTs = await NFTs.findAll({
            where: {
                contractAddress: qCollection.contractAddress,
                is_minted : true
            }
        });
        result.number_of_assets = qNFTs.length;
        for (let i = 0; i < qNFTs.length; i++) {
            let NFT = qNFTs[i].dataValues;

            //해당 NFT 의 trade 정보
            let qTrades = await Trades.findAll({
                where: {
                    token_ids : NFT.token_ids,
                    collectionAddress : qCollection.contractAddress
                }
            });

            //만약 Trade 내역이 존재한다면
            NFT.isSelling = false;
            NFT.price = null;
            NFT.trade_ca = null;
            NFT.seller = null;
            
            if(qTrades.length > 0) {
                for (let j = 0; j < qTrades.length; j++) {
                    //selling 중인 trade 가 있다면
                    if(qTrades[j].status === 'selling') {
                        NFT.isSelling = true;
                        NFT.price = qTrades[j].price;
                        NFT.trade_ca = qTrades[j].trade_ca;
                        NFT.seller = qTrades[j].seller;
                    }
                }
            }
            result.assets.push(NFT);
        }
        //console.log(result);

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
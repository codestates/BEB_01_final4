const express = require('express');
const { NFTs, Collections } = require('../models');
const router = express.Router();
const config = require('../config/config');
const hostURI = config.development.host_metadata;

/*
 *  /assets
 *  All NFTs List
 *  향후 조건을 입력받아 처리해 줄 듯
 */
router.get('/', async (req, res, next) => {
    console.log('?');
    try {
        const allNFTs = await NFTs.findAll({
            where: {
                is_minted: true
            }
        });
        res.json({ message: "ok", data: allNFTs });
    } catch (err) {
        console.error(err);
    }
});

/*
 *  /assets/<collection_symbol>/<token_ids>
 *  NFT 1개 상세
 *  required: collection_symbol, token_ids
 */
router.get('/:symbol/:token_ids', async (req, res, next) => {
    console.log(req.params.symbol);
    console.log(req.params.token_ids);
    const reqSymbol = req.params.symbol;
    const reqID = req.params.token_ids;
    
    //join해줘야 되는데 sequelize로 어떻게 하지?
    const collection = await Collections.findOne({
        where: {
            symbol: reqSymbol
        }
    });
    
    const nft = await NFTs.findOne({ where: {
        contractAddress: collection.dataValues.contractAddress, 
        token_ids: reqID,
        is_minted: true
    }});
    
    //user 정보도 추가할 필요 있음
    let result = nft.dataValues;
    result.collection = collection.dataValues;
    console.log(result);

    if (!nft) {
        res.status(400).json({ message: "token_ids가 일치하는 NFT가 없습니다" });
        return;
    }
    res.json({ message: "ok", data: result });
});

/*
 *  /assets
 *  NFT 데이터 생성 (metadata 정보 회신)
 *  required: ownerAddress, contractAddress, name, description, traits, imageURI
 */
router.post('/', async (req, res, next) => {
    try {
        console.log(`======== [POST] /assets ========`);
        //입력 인자 가공
        if (!req.body.ownerAddress || !req.body.contractAddress ||
            !req.body.name || !req.body.description ||
            !req.body.traits || !req.body.imageURI) {
            throw new SyntaxError("required: ownerAddress, contractAddress, name, description, traits, imageURI");
        }

        let reqData = {
            ownerAddress: req.body.ownerAddress,
            creatorAddress: req.body.ownerAddress,
            contractAddress: req.body.contractAddress,
            name: req.body.name,
            description: req.body.description,
            //traits: JSON.stringify(req.body.traits),
            traits: req.body.traits,
            imageURI: req.body.imageURI
        };

        let qRes = await NFTs.create(reqData);
        let tokenURI = `${hostURI}/metadata/nft/${qRes.dataValues.id}`;

        console.log(`tokenURI 가 생성됨 : ${tokenURI}`);
        res.status(200).json({
            message: 'ok',
            data: {
                tokenURI
            }
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
const express = require('express');
const { Collections, NFTs } = require('../models');
const router = express.Router();
const config = require('../config/config');
const hostURI = config.development.host_metadata;

/*
 *  query an COLLECTION metadata
 */
router.get('/collection/:ID', async (req, res, next) => {
    const reqID = req.params.ID;

    try {
        const q = await Collections.findOne({where:{id: reqID}});
        if(q) {
            const qRes = q.dataValues;
            
            let result = {
                //contractAddress
                //ownerAddress
                name : qRes.name,
                symbol : qRes.symbol,
                description : qRes.description,
                image_url : qRes.image_url, 
                banner_url : qRes.banner_url,
                //createdAt : qRes.createdAt,
                //updatedAt : qRes.updatedAt
            };
            console.log(result);
            
            res.status(200).json({
                message: 'ok',
                data: result
            });
        } else {
            res.status(409).json({
                message: '데이터가 존재하지 않습니다',
                data: null
            });
        }
    } catch (err) {
        console.error(err);
        res.status(409).json({
            message: err,
            data: null
        });
    }
});

/*
 *  query an NFT metadata
 */
router.get('/nft/:ID', async (req, res, next) => {
    const reqID = req.params.ID;

    try {
        const q = await NFTs.findOne({where:{id: reqID}});
        if(q) {
            const qRes = q.dataValues;

            let result = {
                //token_ids : qRes.token_ids,
                name : qRes.name,
                description : qRes.description,
                imageURI : qRes.imageURI,
                traits : JSON.parse(qRes.traits),
            };
            
            res.status(200).json({
                message: 'ok',
                data: result
            });
        } else {
            res.status(409).json({
                message: '데이터가 존재하지 않습니다',
                data: null
            });
        }
    } catch (err) {
        console.error(err);
        res.status(409).json({
            message: err,
            data: null
        });
    }
});

/*
 *  /metadata/collection/<id>
 *  collection metadata 수정
 *  optional: description, image_url, banner_url
 *  name 및 symbol 은 블록에 저장되어 변경 불가
 */
router.post('/collection/:id', async (req, res, next) => {
    const reqID = req.params.id;

    try {
        console.log(`======== [POST] /metadata/collection/${reqID} ========`);
        
        const qCollection = await Collections.findOne({ where: { 
            id: reqID 
        }});

        if (!qCollection) {
            throw new Error('collection 이 존재하지 않습니다');
        }
    
        const reqData = {
            description: req.body.description || qCollection.dataValues.description,
            image_url: req.body.image_url || qCollection.dataValues.image_url,
            banner_url: req.body.banner_url || qCollection.banner_url
        }

        const result = await Collections.update(reqData, { where: { 
            id: reqID
        }})
        let collectionURI = `${hostURI}/metadata/collection/${reqID}`;

        res.status(200).json({
            message: '업데이트 완료',
            data: collectionURI
        });
    } catch (err) {
        console.error(`에러 ${err}`);
        res.status(400).json({
            message: err.message,
            data: null
        });
    }
})

/*
 *  /metadata/nft/<id>
 *  nft metadata 수정
 *  optional: name, description, traits, imageURI
 *  tokenURI 만 블록에 저장됨
 */
router.post('/nft/:id', async (req, res, next) => {
    const reqID = req.params.id;

    try {
        console.log(`======== [POST] /metadata/nft/${reqID} ========`);
        
        const qNFT = await NFTs.findOne({ where: { 
            id: reqID 
        }});

        if (!qNFT) {
            throw new Error('nft 이 존재하지 않습니다');
        }
        
        const reqData = {
            name: req.body.name || qNFT.dataValues.name,
            description: req.body.description || qNFT.dataValues.description,
            traits: req.body.traits || qNFT.dataValues.traits,
            imageURI: req.body.imageURI || qNFT.dataValues.imageURI,
        }

        const result = await NFTs.update(reqData, { where: { 
            id: reqID
        }})
        
        res.status(200).json({
            message: '업데이트 완료',
            data: qNFT.dataValues.tokenURI
        });
    } catch (err) {
        console.error(`에러 ${err}`);
        res.status(400).json({
            message: err.message,
            data: null
        });
    }
})

module.exports = router;
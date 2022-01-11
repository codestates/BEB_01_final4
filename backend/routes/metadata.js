const express = require('express');
const { Collections, NFTs } = require('../models');
const router = express.Router();

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

module.exports = router;
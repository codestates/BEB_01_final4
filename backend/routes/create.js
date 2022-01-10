const express = require('express');
const { NFTs } = require('../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.json(`${req.method}: ${req.url}`);
});

router.post('/', (req, res, next) => {
    console.log(req.body.description);
    NFTs.create({
        tokenURI: req.body.tokenURI,
        name: req.body.name,
        description: req.body.description,
    })
        .then(res => {
            console.log('DB 저장 완료');
        })
        .catch(err => {
            console.log(err);
            res.json({ isSaveDB: false, message: "DB 저장 실패" });
        })
    res.json({ isSaveDB: true, message: "DB 저장 완료" });

})

module.exports = router;
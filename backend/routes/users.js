const express = require('express');
const { NFTs } = require('../models');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const nfts = await NFTs.findAll();
        res.json({ nfts });
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;
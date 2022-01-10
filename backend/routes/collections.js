const express = require('express');
const { NFTs } = require('../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.json(`${req.method}: ${req.url}`);
});

module.exports = router;
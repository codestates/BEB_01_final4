const express = require('express');
const { Users, Collections, NFTs } = require('../models');
const collections = require('../models/collections');
const router = express.Router();


/*
 *  /users/<address>
 *  마이 페이지 (유저정보 + 보유 collections + 보유 assets)
 *  required: address
 */
router.get('/:address', async (req, res, next) => {
    console.log(req.params.address);
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }

    //유저가 보유한 collection
    const myCollections = await Collections.findAll({ where: { 
        ownerAddress: address,
        is_created : true
    }})

    //유저가 보유한 NFTs
    const myNFTs = await NFTs.findAll({ where: { 
        ownerAddress: address,
        is_minted: true
    }})

    let result = user.dataValues;
    
    result.num_of_collections = myCollections.length;
    result.num_of_assets = myNFTs.length;
    result.collections = [];
    result.assets = [];
    for(let i=0;i<myCollections.length;i++) {
        result.collections.push(myCollections[i].dataValues);
    }
    for(let i=0;i<myNFTs.length;i++) {
        result.assets.push(myNFTs[i].dataValues);
    }
    console.log(result)

    //res.status(200).json({ message: "ok", data: user });
    res.status(200).json({ message: "ok", data: result });
});

// 내 보유 컬렉션
router.get('/:address/collections', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }
    const myCollections = await Collections.findAll({ where: { 
        ownerAddress: address,
        is_created : true
    }})

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
    const myNFTs = await NFTs.findAll({ where: { 
        ownerAddress: address,
        is_minted: true
    }})
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
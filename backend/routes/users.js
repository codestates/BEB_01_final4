const express = require('express');
const { Users, Collections } = require('../models');
const router = express.Router();


// 마이 페이지
router.get('/:address', async (req, res, next) => {
    console.log(req.params.address);
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }
    res.status(200).json({ message: "ok", data: user });
});

// 내 보유 컬렉션
router.get('/:address/collections', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({ where: { address: address } });

    if (!user) {
        res.status(400).json({ message: "address가 일치하는 user가 없습니다" });
        return;
    }
    const myCollections = await Collections.findAll({ where: { ownerAddress: address } })
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
    const myNFTs = await NFTs.findAll({ where: { ownerAddress: address } })
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

// 내 정보 생성
// imageURL 이외에 address, name, eamil 필수
router.post('/', async (req, res, next) => { // User: address, imageURL, name, email
    if (!req.body.address || !req.body.name || !req.body.email) {
        res.status(400).json({ message: "address, name, email이 정확히 기입되었는지 확인해 주세요" });
        return;
    }

    const isExistAddress = await Users.findOne({ where: { address: req.body.address } });
    if (isExistAddress) {
        res.status(400).json({ message: "이미 존재하는 address입니다" });
        return;
    }

    const isExistEmail = await Users.findOne({ where: { email: req.body.email } });
    if (isExistAddress) {
        res.status(400).json({ message: "이미 존재하는 email입니다" });
        return;
    }


    const newUser = {
        address: req.body.address,
        imageURL: req.body.imageURL,
        name: req.body.name,
        email: req.body.email,
    }
    Users.create(newUser)
        .then(result => {
            console.log('DB 저장 완료');
            res.status(200).json({ message: "ok", data: newUser });
        })
        .catch(err => {
            console.log(err);
            res.json({ message: "false" });
        })

})

module.exports = router;
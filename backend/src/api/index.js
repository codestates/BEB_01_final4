const Router = require('koa-router');
const api = new Router();
const { NFT } = require('../models/NFT');

api.get('menu1', (ctx, next) => {
    ctx.body = 'GET' + ctx.request.path;
});

api.get('mint-nft', (ctx, next) => {
    ctx.body = 'GET' + ctx.request.path;
})

api.post('mint-nft', (ctx, next) => {

    const nft = new NFT(ctx.request.body);

    try {
        nft.save();
    }
    catch (e) {
        return ctx.throw(500, e);
    }
    ctx.body = nft;

})

module.exports = api;
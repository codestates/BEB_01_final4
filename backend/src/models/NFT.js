const mongoose = require('mongoose');

const nftSchema = mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    properties: {
        type: Array,
        default: [],
    },
    external_url: {
        type: String,
    },
})


const NFT = mongoose.model('NFT', nftSchema);

module.exports = { NFT }
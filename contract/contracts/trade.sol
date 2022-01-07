// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;


contract trade{
    address private to;
    address private from;
    address private collection;
    uint256 private tokenId;
    uint256 private price;
    uint256 private balance;

    constructor(address _from, address _collection, uint256 _tokenId, uint256 _price){
        //원래주인, collection, tokenid, price
        from = _from;
        collection = _collection;
        tokenId = _tokenId;
        price = _price;
    }

    function getPrice() public view returns(uint256){
        return price;
    }

    


}
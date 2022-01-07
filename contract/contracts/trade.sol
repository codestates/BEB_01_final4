// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;


contract trade{
    address private to;
    address private from;
    address private collection;
    uint256 private tokenId;
    uint256 private price;
    uint256 private balance;
    bool private isAble;
    uint256 private _balance;
    bool private _canTrade;

    constructor(address _from, address _collection, uint256 _tokenId, uint256 _price) payable {
        //원래주인, collection, tokenid, price
        from = _from;
        collection = _collection;
        tokenId = _tokenId;
        price = _price;
        isAble = true;
        _canTrade = false;
    }

    modifier isValid(){//활성화 유무 검사
        require(isAble,"Trade: This contract is not valid");
        _;
    }

    modifier canTrade(){//현재 거래중인지 검사
        require(!_canTrade,"Trade: Trading other wallet now");
        _;
    }

    receive() external payable isValid canTrade{
        trading();
    }

    function trading() public payable isValid canTrade returns(bytes memory){
        _canTrade = true;
        _balance = _balance + msg.value;
        require(_balance == price,"Trade: Does not match the price");
        //회사에 수수료 납부
        (bool checkSend,) = from.call{value:_balance}("");//from에게 금액 전송
        require(checkSend,"Trade: Send Eth fail");
        (bool check, bytes memory data) = collection.delegatecall(abi.encodeWithSignature("transferFrom(address,address,uint256)",from,msg.sender,tokenId));//from,to id 구매자에게 nft 전달
        require(check,"Trade: Transfer nft fail");
        
        //거래종료//
        isAble = false;//비활성화 
        _canTrade = false;  

        return data;
    }

    

    function setInvalid(address owner) public isValid {
        require(owner == from,"Trade: This address is not owner");//권한 검사 
        //trade 신청한 주소만 contract를 비활성화 할 수 있다.
        //한번 비활성화 하면 다시 되돌릴 수 없다.
        isAble = false;
    }

    function getPrice() public view isValid returns(uint256){
        return price;
    }

    function getBalance() public view isValid returns(uint256){
        return _balance;
    }

    


}
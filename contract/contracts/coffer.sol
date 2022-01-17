// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./multiOwner.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract coffer is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private nftIdx;   
    //wallet에서 소유하고있는 nft info
    struct info{
        address collection;
        uint256 tokenId;
    }

    address nftAddress;
    uint256 nftPrice;
    mapping(address => uint256) private stake;//누가 얼마의 지분을 가지는가
    mapping(uint256 => info) private nftList;
    mapping(address => bool) private pendingUser;
    uint256 totalStake;

    event request(address indexed sender);
    event delNft(uint256 indexed _tokenId);
    constructor() payable {
        addOwnership(msg.sender);//처음 nft구매 제안자를 owner로 등록
    }

    //collection에서 transferFrom 사용해서 지갑으로 소유권 이전 가능
    function transferNft(address _collection, uint256 _tokenId) public onlyOwner{
        (bool check,) = address(_collection).delegatecall(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                _tokenId
            )
        );
        require(check,"Coffer: Transfer nft owner fail");
        nftIdx.increment();
        nftList[nftIdx.current()] = info(_collection,_tokenId);


    }

//구매는 1 대여는 2
    function _payment(address _collection, uint256 _tokenId, uint256 price, uint256 option) internal onlyOwner{
        require(address(this).balance >= price,"Coffer: Not enough ether");
        (bool check,) = payable(_collection).call{value:price }(
            abi.encodeWithSignature(
                "payment(uint256,uint256)",
                option,
                _tokenId
            ));
        require(check,"Coffer: Payment fail");
        nftIdx.increment();
        nftList[nftIdx.current()] = info(_collection,_tokenId);
    }
//판매등록 및 대여 등록
    function _setTrade(address _collection, uint256 _tokenId, uint256 price, uint256 option) internal onlyOwner{
        require(option == 1 || option == 2,"Coffer: This option is not valid");
        if(option == 1){
            (bool check,) = address(_collection).call(abi.encodeWithSignature( "sell(uint256,uint256)",_tokenId,price));
            require(check,"Coffer: Sell fail");
            _burn(_tokenId);
        }else{
            (bool check,) = address(_collection).call(abi.encodeWithSignature( "rent(uint256,uint256)",_tokenId,price));
            require(check,"Coffer: Sell fail");
        }
    }   

//판매등록시 관리하는 nft 목록에서 제거
    function _burn(uint256 _tokenId)internal onlyOwner{
        require(nftList[_tokenId].collection != address(0) && nftList[_tokenId].tokenId != 0,"Coffer: Invalid tokenId");
        nftList[_tokenId] = info(address(0),0);
        emit delNft(_tokenId);
    }

    function joinRequest() public{
        require(msg.sender != address(0),"Coffer: Not a address");
        require(!isOwner(msg.sender),"Coffer: Already join this coffer");
        require(!pendingUser[msg.sender],"Coffer: Already in pending");
        pendingUser[msg.sender] = true;
        emit request(msg.sender);
    }

    function totalSupply() public view returns(uint256){
        return nftIdx.current();
    }


    //request -> vote/대기상태 -> 승인/기각


    //투표, 지분, 지분  뺐을때 패널티, 수익분배 ....

}
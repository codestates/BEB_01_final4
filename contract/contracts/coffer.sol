// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ownerable.sol";

contract coffer is Ownable {
    address nftAddress;
    uint256 nftPrice;
    mapping(address => uint256) public stake;//누가 얼마의 지분을 가지는가
    uint256 totalStake;
    address company;

    constructor(address _nftAddress, uint256 _nftPrice){
        nftAddress = _nftAddress;
        nftPrice = _nftPrice;
        addOwnership(msg.sender);//처음 nft구매 제안자를 owner로 등록
        company = msg.sender;//최초 생성은 service 제공자
    }
    
    modifier beforeStaking(){
        require(totalStake < nftPrice,"Staking: full staking");
        _;
    }

    function staking(uint256 stakingPrice) public beforeStaking returns(bool){
        require(stakingPrice != 0,"Staking: wrong price");
        addOwnership(msg.sender);//owner 등록
        stake[msg.sender] = stakingPrice;//staking
        (bool check, uint256 ans) = SafeMath.tryAdd(totalStake,stakingPrice);
        require(check,"Staking: add total fail");
        totalStake = ans;
        return true;

    }


    //투표, 지분, 지분  뺐을때 패널티, 수익분배 ....

}
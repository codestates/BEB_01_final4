// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract Ownable {
    using SafeMath  for uint256 ;
    mapping(address=>bool) private _owner;
    uint256 totalOwner;
    event OwnershipAdd(address indexed Owner);
    event OwnershipDel(address indexed Owner);

    constructor() {
        _addOwnership(msg.sender);
    }

    //owner 검사
    function isOwner(address target) public view virtual returns (bool) {
        return _owner[target];
    }


    modifier onlyOwner() {
        require(isOwner(msg.sender) , "Ownable: caller is not the owner");
        _;
    }
    
//owner 추가
    function addOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _addOwnership(newOwner);
    }

    
    function _addOwnership(address newOwner) internal virtual {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _owner[newOwner] = true;
        (bool check ,uint256 ans)= SafeMath.tryAdd(totalOwner,1);
        require(check);
        totalOwner = ans;
        emit OwnershipAdd(newOwner);
    }

//owner 삭제
   

    function _delOwnership(address Owner) internal virtual {
        require(Owner != address(0), "Ownable: owner is the zero address");
        _owner[Owner] = false;
        (bool check ,uint256 ans)= SafeMath.trySub(totalOwner,1);
        require(check);
        totalOwner = ans;
        emit OwnershipDel(Owner);
    }

    //전체 owner수 조회
    function getTotal() public view returns(uint256){
        return totalOwner;
    }

}
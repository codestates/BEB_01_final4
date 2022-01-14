// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract rent {
    using SafeMath for uint256;

    address private from;
    address private collection;
    uint256 private tokenId;
    uint256 private price;
    bool private isAble;
    bool private _canRent;

    constructor(
        address _from,
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) payable {
        from = _from;
        collection = _collection;
        tokenId = _tokenId;
        price = _price;
        (bool check, ) = collection.delegatecall(
            abi.encodeWithSignature(
                "approveRent(address,uint256)",
                msg.sender,
                tokenId
            )
        ); //rent contract에게 대여권한 부여
        require(check, "Rent: Approved rent nft fail");
    }

    modifier isValid() {
        //활성화 유무 검사
        require(isAble, "Rent: This contract is not valid");
        _;
    }

    modifier canRent() {
        //현재 거래중인지 검사
        require(!_canRent, "Rent: Rent other wallet now");
        _;
    }

    receive() external payable isValid canRent {
        rentNFT();
    }

    function rentNFT() public payable isValid canRent {
        _canRent = true;
        require(msg.value == price, "Rent: Does not match the price");
        (bool checkSend, ) = payable(from).call{value: _balance}(""); //from에게 금액 전송
        require(checkSend, "Rent: Send Eth fail");

        address _to = msg.sender;
        (bool check, ) = collection.call(
            abi.encodeWithSignature("setRent(uint256,address)", tokenId, _to)
        ); //from,to id 구매자에게 nft 전달
        require(check, "Rent: Rent nft fail");
        _canRent = false;
    }

    function setInvalid(address owner) public isValid {
        require(owner == from, "Trade: This address is not owner"); //권한 검사
        //trade 신청한 주소만 contract를 비활성화 할 수 있다.
        //한번 비활성화 하면 다시 되돌릴 수 없다.
        isAble = false;
    }
}

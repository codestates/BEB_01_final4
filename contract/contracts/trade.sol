// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract trade {
    using SafeMath for uint256;

    address private from;
    address private collection;
    uint256 private tokenId;
    uint256 private price;
    uint256 private balance;
    bool private isAble;
    uint256 private _balance;
    bool private _canTrade;
    address private company = 0x459F501012aD38d0cC52C0fd0669B1F7764f3814;
    uint256 private tradeFees = 10;

    event endTrade(uint256 indexed tokenId, address newOwner);

    constructor(
        address _from,
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) payable {
        //원래주인, collection, tokenid, price
        from = _from;
        collection = _collection;
        tokenId = _tokenId;
        price = _price;
        isAble = true;
        _canTrade = false;
    }

    modifier isValid() {
        //활성화 유무 검사
        require(isAble, "Trade: This contract is not valid");
        _;
    }

    modifier canTrade() {
        //현재 거래중인지 검사
        require(!_canTrade, "Trade: Trading other wallet now");
        _;
    }

    modifier isCompany() {
        require(
            msg.sender == 0xa17a8fed984b114bcC38D4c5A800BE4456E22736,
            "Trade: This address is not company"
        );
        _;
    }

    receive() external payable isValid canTrade {
        trading();
    }

    function setCompany(address newCompany) public isCompany returns (bool) {
        company = newCompany;
        return true;
    }

    function setTradeFees(uint256 newFees) public isCompany returns (bool) {
        tradeFees = newFees;
        return true;
    }

    function trading() public payable isValid canTrade {
        _canTrade = true;
        _balance = _balance + msg.value;
        require(_balance == price, "Trade: Does not match the price");

        (bool checkDiv, uint256 fee) = SafeMath.tryDiv(_balance, tradeFees);
        require(checkDiv, "Trade: Trade fee error");
        _balance = _balance - fee;
        (bool checkSendCompany, ) = payable(company).call{value: fee}(""); //회사에 수수료 납부
        require(checkSendCompany, "Trade: Send trade fee fail");

        (bool checkSend, ) = payable(from).call{value: _balance}(""); //from에게 금액 전송
        require(checkSend, "Trade: Send Eth fail");
        address _to = msg.sender;
        (bool check, ) = collection.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                from,
                _to,
                tokenId
            )
        ); //from,to id 구매자에게 nft 전달
        require(check, "Trade: Transfer nft fail");

        //거래종료//
        isAble = false; //비활성화
        _canTrade = false;

        emit endTrade(tokenId, _to);
    }

    function setInvalid(address owner) public isValid {
        require(owner == from, "Trade: This address is not owner"); //권한 검사
        //trade 신청한 주소만 contract를 비활성화 할 수 있다.
        //한번 비활성화 하면 다시 되돌릴 수 없다.
        isAble = false;
    }

    function getPrice() public view isValid returns (uint256) {
        return price;
    }

    function getBalance() public view isValid returns (uint256) {
        return _balance;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./multiOwner.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract coffer is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _nftIdx;

    struct nftInfo {
        address collection;
        uint256 tokenId;
    }

    struct tradableNft {
        nftInfo info;
        uint256 price;
        mapping(address => uint256) stake;
        uint8 option; //1 ~ 구매, 2 ~ 대여
        address[] joinAddr; //참여자 list
    }

    tradableNft private _targetNft;
    bool private _isReady = false;

    mapping(uint256 => tradableNft) private _nfts; //거래가 완료되면 _targetNft가 들어간다. 이후 _isReady가 false로 바뀌고 target도 초기화

    uint256 private _totalStake = 0; //현재 wallet에 얼마가 들어있나 기록
    mapping(address => uint256) private _stake; //누가 얼마나 예치했나 기록
    //event start//
    event set_target(
        address _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option
    ); //거래하고자 하는 nft info set할때 발생하는 event
    event payment(
        address _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option
    );
    event setTrade(uint256 listIdx, uint256 price, uint256 option);

    //event end//
    constructor(
        address _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option
    ) payable {
        _addOwnership(address(this)); //wallet 자기자신이 wallet의 ower이다.
        //multiOwner에서 msg.sender은 자동으로 owner 등록
        if (
            _collection != address(0x0) &&
            _tokenId != 0 &&
            _price != 0 &&
            _option > 0 &&
            _option < 3
        ) {
            //3개 모두 유효한 값이면 구매희망 바로 등록
            require(msg.value != 0, "Coffer: Stake ether fail");
            _isReady = true;
            _totalStake += msg.value;
            _stake[msg.sender] += msg.value;
            _setTarget(_collection, _tokenId, _price, _option, msg.value);
        }
    }

    //data 없이 ether만 전송된 경우 reject
    receive() external payable {
        require(false, "Coffer: Tx must has data");
    }

    //거래하려는 nft setting start
    //구매 혹은 대여하고자 하는 nft 등록
    function _setTarget(
        address _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option,
        uint256 stake_
    ) internal onlyOwner {
        require(_collection != address(0x0), "Coffer: Invalid address");
        require(_tokenId != 0, "Coffer: Invalid tokenId");
        require(_price != 0, "Coffer: Invalid price");
        require(_option == 1 || _option == 2, "Coffer: Invalid option");

        _targetNft.info.collection = _collection;
        _targetNft.info.tokenId = _tokenId;
        _targetNft.price = _price;
        _targetNft.option = _option;
        _targetNft.stake[msg.sender] = stake_;
        _targetNft.joinAddr.push(msg.sender);

        emit set_target(_collection, _tokenId, _price, _option);
    }

    //외부에서 target 설정할 때 사용
    /*
      function setTarget(
        address _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option
    ) public payable onlyOwner {
        require(msg.value != 0, "Coffer: Stake ether fail");
        require(!_isReady, "Coffer: Already has target");//한번에 하나의 nft만 거래할 수 있다.
        _totalStake += msg.value;
        _stake[msg.sender] += msg.value;
        _setTarget(_collection, _tokenId, _price,_option,msg.value);
        
    }    
    */

    //거래하려는 nft setting end

    //ether 지불
    function _payment() internal onlyOwner {
        require(_totalStake >= _targetNft.price, "Coffer: Not enough ether");
        (bool check, ) = payable(_targetNft.info.collection).call{
            value: _targetNft.price
        }(
            abi.encodeWithSignature(
                "payment(uint256,uint256)",
                uint256(_targetNft.option),
                _targetNft.info.tokenId
            )
        );
        require(check, "Coffer: Payment fail");

        //거래 성공시 누적
        _totalStake -= _targetNft.price; //총액에서 차감
        _nftIdx.increment();
        uint256 _idx = _nftIdx.current();
        _nfts[_idx].info.collection = _targetNft.info.collection;
        _nfts[_idx].info.tokenId = _targetNft.info.tokenId;
        _nfts[_idx].price = _targetNft.price;
        _nfts[_idx].option = _targetNft.option;
        //mapping 복사
        for (uint8 i = 0; i < _targetNft.joinAddr.length; i++) {
            _nfts[_idx].stake[_targetNft.joinAddr[i]] = _targetNft.stake[
                _targetNft.joinAddr[i]
            ];
            _stake[_targetNft.joinAddr[i]] -= _targetNft.stake[
                _targetNft.joinAddr[i]
            ]; //stake 금액에서 차감
        }

        //tradable 초기화
        _isReady = false;
        _targetNft.info.collection = address(0x0);
        _targetNft.info.tokenId = 0;
        _targetNft.price = 0;
        _targetNft.option = 0;
        for (uint8 i = 0; i < _targetNft.joinAddr.length; i++) {
            _targetNft.stake[_targetNft.joinAddr[i]] = 0; //거래 성공했으므로 초기화
            _targetNft.joinAddr.pop(); //삭제
        }

        emit payment(
            _nfts[_idx].info.collection,
            _nfts[_idx].info.tokenId,
            _nfts[_idx].price,
            _nfts[_idx].option
        );
    }

    function payback(uint256 _price) public payable onlyOwner {
        require(_price != 0, "Coffer: Invalid balance");
        require(_stake[msg.sender] >= _price, "Coffer: Wrong balance");
        (bool check, ) = payable(msg.sender).call{value: _price}("");
        require(check, "Coffer: Payback fail");
        _stake[msg.sender] -= _price;
        _totalStake -= _price;
    }

    //개인이 소유한 nft의 소유권을 공동 wallet으로 이전
    function transferNft(address _collection, uint256 _tokenId)
        public
        onlyOwner
    {
        (bool check, ) = address(_collection).delegatecall(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                _tokenId
            )
        );
        require(check, "Coffer: Transfer nft owner fail");
        _nftIdx.increment();
        uint256 idx = _nftIdx.current();
        _nfts[idx].info.collection = _collection;
        _nfts[idx].info.tokenId = _tokenId;
        _nfts[idx].stake[msg.sender] = 100;
        _nfts[idx].option = 1;
        _nfts[idx].joinAddr.push(msg.sender);
    }

    //거래 등록
    function _setTrade(
        uint256 listIdx,
        uint256 price,
        uint256 option
    ) internal onlyOwner {
        require(
            _nfts[listIdx].info.collection != address(0x0),
            "Coffer: Invalid collection address to trade"
        );
        require(
            _nfts[listIdx].info.tokenId != 0,
            "Coffer: Invalid tokenId to trade"
        );
        require(option == 1 || option == 2, "Coffer: This option is not valid");
        require(_nfts[listIdx].option != 2, "Coffer: Can not trade rental nft"); //대여중인 nft는 거래 x
        _nfts[listIdx].price = price; //재 설정한 가격으로 변경
        if (option == 1) {
            (bool check, ) = address(_nfts[listIdx].info.collection).call(
                abi.encodeWithSignature(
                    "sell(uint256,uint256)",
                    _nfts[listIdx].info.tokenId,
                    price
                )
            );
            require(check, "Coffer: Sell fail");
            //_burn(listIdx);
        } else {
            (bool check, ) = address(_nfts[listIdx].info.collection).call(
                abi.encodeWithSignature(
                    "rent(uint256,uint256)",
                    _nfts[listIdx].info.tokenId,
                    price
                )
            );
            require(check, "Coffer: Sell fail");
        }

        emit setTrade(listIdx, price, option);
    }
}

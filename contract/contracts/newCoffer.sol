// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./multiOwner.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract coffer is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _nftIdx;
    Counters.Counter private _suggestIdx;

    struct voteData {
        address target; //가입 요청 address 또는 collection address
        uint256 idx; //가입 요청의 경우 0, 이외엔 tokenid
        uint256 price; //가입 요청의 경우 임시 staking 금액, 이외엔 가격
        uint256 nftIdx; //가입=0, 나머지 idx값;
    }

    struct suggest {
        uint8 state; //1: reject 2: wait 3:pass
        uint8 types; //0:join , 1: sell, 2: rent, 3: pay
        uint256 agree;
        uint256 disagree;
        voteData data;
        uint256 date; //최초 등록일
    }

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
        uint256 stakingBalance;
    }

    tradableNft private _targetNft;
    uint256 private _targetBalance = 0;
    bool private _isReady = false;

    mapping(uint256 => tradableNft) private _nfts; //거래가 완료되면 _targetNft가 들어간다. 이후 _isReady가 false로 바뀌고 target도 초기화

    uint256 private _totalStake = 0; //현재 wallet에 얼마가 들어있나 기록
    mapping(address => uint256) private _stake; //누가 얼마나 예치했나 기록 => 현재 ether형태로 존재하는 금액
    mapping(address => uint256) private _totalBalance; //누가 얼마나 예치했나 기록 => ether 형태 + nft 금액
    mapping(uint256 => suggest) private _suggestion; //투표 안건

    mapping(address => uint256) private _queue; //가입 요청하는 사용자 queue 관리
    mapping(uint256 => mapping(address => uint256)) private _sellNftStake; //지분판매 관리
    mapping(address => mapping(uint256 => uint256)) private _allocateNft; //판매 혹은 대여 등록된 nft collection => tokenid => _nfts id, 거래 완료후 해당 nft찾아서 분배하기 위함
    //event start//
    event set_target(
        address indexed _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option
    ); //거래하고자 하는 nft info set할때 발생하는 event
    event payment(
        address indexed _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option
    );
    event set_trade(uint256 indexed listIdx, uint256 price, uint256 option);
    event set_suggestion(
        uint256 indexed _suggestionIdx,
        uint8 _type,
        address _target,
        uint256 _tokenId,
        uint256 _price
    );
    event pass(uint8 _type, uint256 indexed _idx);
    event reject(uint8 _type, uint256 indexed _idx);
    event sellNftStake(uint256 indexed _idx, uint256 price, address _owner);
    event buyNftStake(uint256 indexed _idx, uint256 price, address _owner);

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
            _totalBalance[msg.sender] += msg.value;
            _targetBalance += msg.value;
            _setTarget(
                _collection,
                _tokenId,
                _price,
                _option,
                msg.sender,
                msg.value
            );
        }
    }

    //public getter function

    function getStateOfSuggestion(uint256 _idx) public view returns (uint8) {
        if (_suggestion[_idx].date + 1 days > block.timestamp) {
            return 1; //reject
        }
        return _suggestion[_idx].state;
    }

    function getStakeFromNFT(uint256 _idx, address _target)
        public
        view
        returns (uint256)
    {
        return _nfts[_idx].stake[_target];
    }

    function getSuggestionState(uint256 _idx)
        public
        view
        onlyOwner
        returns (uint8)
    {
        return _suggestion[_idx].state;
        //1: reject 2: wait 3:pass
    }

    function getOwnersOfNFT(uint256 _idx)
        public
        view
        returns (address[] memory)
    {
        return _nfts[_idx].joinAddr;
    }

    function isOnSale(uint256 _idx, address _owner) public view returns (bool) {
        return _sellNftStake[_idx][_owner] != 0;
    }

    //탈퇴
    function withdraw() public onlyOwner {
        require(_queue[msg.sender] == 0, "Coffer: Withdraw fail");
        require(_totalBalance[msg.sender] == 0, "Coffer: Withdraw fail"); //wallet 안에 자산이 없는 경우에만
        _delOwnership(msg.sender);
    }

    //data 없이 ether만 전송된 경우 가입자면 기본 stake 추가
    receive() external payable {
        if (isOwner(msg.sender)) {
            _stake[msg.sender] += msg.value;
            _totalBalance[msg.sender] += msg.value;
            _totalStake += msg.value;
        }
    }

    //거래 이후 분배
    function allocate(address _collection, uint256 _tokenId) public payable {
        require(
            _allocateNft[_collection][_tokenId] != 0,
            "Coffer: This nft not on trade"
        );
        uint256 _idx = _allocateNft[_collection][_tokenId];
        uint256 profit = msg.value;
        //자산 분배
        for (uint256 i = 0; i < _nfts[_idx].joinAddr.length; i++) {
            uint256 stakePerMember = _nfts[_idx].stake[_nfts[_idx].joinAddr[i]];
            (bool stakeCheck, uint256 percentage) = SafeMath.tryDiv(
                (stakePerMember * 100),
                _nfts[_idx].price
            );
            require(stakeCheck, "Coffer: Allocate fail");
            (bool profitCheck, uint256 profitPerMember) = SafeMath.tryDiv(
                (percentage * 100),
                profit
            );
            require(profitCheck, "Coffer: Allocate profit fail");
            _stake[_nfts[_idx].joinAddr[i]] += profitPerMember;
            _totalBalance[_nfts[_idx].joinAddr[i]] += profitPerMember;
        }
        if (_nfts[_idx].option == 1) {
            //해당 nft 소각
            _nfts[_idx].info.collection = address(0x0);
            _nfts[_idx].info.tokenId = 0;
            //비활성화
        }
    }

    //지분 판매 등록
    function sellStakeOFNFT(uint256 _idx, uint256 _price) public onlyOwner {
        require(
            _nfts[_idx].info.collection != address(0x0),
            "Coffer: Invalid collection address"
        );
        require(_nfts[_idx].info.tokenId != 0, "Coffer: Invalid tokenId");
        require(_price != 0, "Coffer: Price can not 0");
        require(
            _nfts[_idx].stake[msg.sender] != 0,
            "Coffer: This address not have stake of target nft"
        );
        require(
            _nfts[_idx].stake[msg.sender] >= _price,
            "Coffer: Can not sell over stake"
        );
        _sellNftStake[_idx][msg.sender] = _price;
        emit sellNftStake(_idx, _price, msg.sender);
    }

    function buyStakeOfNFT(uint256 _idx, address _owner)
        public
        payable
        onlyOwner
    {
        require(
            _sellNftStake[_idx][_owner] != 0,
            "Coffer: This nft stake is not on sale"
        );
        require(
            _nfts[_idx].info.collection != address(0x0),
            "Coffer: Invalid collection address"
        );
        require(_nfts[_idx].info.tokenId != 0, "Coffer: Invalid tokenId");
        require(
            msg.value != _sellNftStake[_idx][_owner],
            "Coffer: Wrong ether"
        );
        if (_nfts[_idx].stake[msg.sender] == 0) {
            _nfts[_idx].joinAddr.push(msg.sender);
        }
        _nfts[_idx].stake[msg.sender] += _sellNftStake[_idx][_owner];
        (bool payCheck, ) = payable(_owner).call{
            value: _sellNftStake[_idx][_owner]
        }("");
        require(payCheck, "Coffer: Buy stake of nft fail");
        emit buyNftStake(_idx, _sellNftStake[_idx][_owner], msg.sender);
    }

    //suggest 등록
    function _setSuggestion(
        uint8 _type,
        address _target,
        uint256 _tokenId,
        uint256 _price,
        uint256 _idx
    ) internal {
        require(
            _type == 0 ||
                _type == 1 ||
                _type == 2 ||
                _type == 3 ||
                _type == 4 ||
                _type == 5 ||
                _type == 6,
            "Coffer: Invalid type"
        );
        _suggestIdx.increment();
        _suggestion[_suggestIdx.current()] = suggest(
            2,
            _type,
            0,
            0,
            voteData(_target, _tokenId, _price, _idx),
            block.timestamp
        );
        emit set_suggestion(
            _suggestIdx.current(),
            _type,
            _target,
            _tokenId,
            _price
        );
    }

    //0이면 공동구매 하기위해 들어옴, 1이면 그냥 wallt 가입
    function requestJoin(uint8 _option) public payable {
        require(msg.sender != address(0x0), "Coffer: Invalid wallet address");
        if (_option == 0) {
            //staking 하면서 들어옴
            require(_isReady, "Coffer: This coffer not have target");
            require(msg.value >= 0.01 ether, "Coffer: Not enough ether");
            _queue[msg.sender] = msg.value; //임시 staking
        }
        _setSuggestion(0, msg.sender, 0, msg.value, 0);
    }

    function requestTrade(
        uint8 _type,
        uint256 _idx,
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) public onlyOwner {
        if (_type == 1 || _type == 2) {
            require(
                _nfts[_idx].info.collection != address(0x0),
                "Coffer: Invalid collection address"
            );
            require(_nfts[_idx].info.tokenId != 0, "Coffer: Invalid tokenId");
            _setSuggestion(
                _type,
                _nfts[_idx].info.collection,
                _nfts[_idx].info.tokenId,
                _price,
                _idx
            );
        } else if (_type == 3 || _type == 4 || _type == 5 || _type == 6) {
            require(
                _collection != address(0x0),
                "Coffer: Invalid collection address"
            );
            require(_tokenId != 0, "Coffer: Invalid tokenId");
            _setSuggestion(_type, _collection, _tokenId, _price, _idx);
        } else {
            require(false, "Coffer: Invalid type");
        }
    }

    //투표권 개수 반환
    function getVoteNum() private view onlyOwner returns (uint256) {
        uint256 maxKey = _nftIdx.current();
        uint256 _sum = 0;
        for (uint256 i = 1; i <= maxKey; i++) {
            if (_nfts[i].option != 0) {
                _sum += _nfts[i].price;
            }
        }
        (bool check, uint256 _voteNum) = SafeMath.tryDiv(
            (_totalBalance[msg.sender] * 100),
            _sum
        );
        if (check) {
            if (_voteNum >= 50) {
                return 3;
            } else if (_voteNum >= 25) {
                return 2;
            } else {
                return 1;
            }
        }
        return 0;
    }

    function staking(address targetAddr) public payable {
        uint256 _bal = _queue[targetAddr];
        if (isOwner(msg.sender) && targetAddr == address(0x0)) {
            require(
                msg.value != 0,
                "Coffer: Staking ether most be more than 0"
            );
            _bal = msg.value;
        }else{
            require(_queue[targetAddr] != 0,"Coffer: Staking ether most be more than 0"); 
        }
        _totalStake += _bal;
        _totalBalance[targetAddr] += _bal;
        (bool _check, uint256 overBalance) = SafeMath.trySub(
            (_targetBalance + _bal),
            _targetNft.price
        );

        if (!_check) {
            overBalance = _bal;
        }

        //target에 정보 등록

        _targetNft.stake[targetAddr] += overBalance; //퍼센트로 관리
        _targetNft.joinAddr.push(targetAddr);
        _targetBalance += overBalance;

        _queue[targetAddr] = 0; //초기화

        if (_targetBalance == _targetNft.price) {
            //구매 진행
            _payment();
        }
    }

    function vote(uint256 _idx, bool _vote) public payable onlyOwner {
        uint8 targetState = _suggestion[_idx].state;
        require(targetState == 2, "Coffer: Already end"); //이미 종료된 suggestion이면 정지

        uint256 targetDate = _suggestion[_idx].date;
        uint8 targetType = _suggestion[_idx].types;
        uint256 targetAgree = _suggestion[_idx].agree;
        uint256 targetDisagree = _suggestion[_idx].disagree;
        address targetAddr = _suggestion[_idx].data.target;
        uint256 targetPrice = _suggestion[_idx].data.price;

        if (targetDate + 1 days < block.timestamp) {
            //reject
            targetState = 1;
            emit reject(targetType, _idx);
        } else {
            uint256 _voteNum;
            (bool check, uint256 _base) = SafeMath.tryDiv(getTotal(), 3);
            require(check, "Coffer: Get base member fail");
            if (getTotal() < 10) {
                _voteNum = 1;
            } else {
                _voteNum = getVoteNum();
            }
            //찬반 계산
            if (_vote) {
                targetAgree += _voteNum;
                if (targetAgree >= 2 * _base + 1) {
                    //pass
                    targetState = 3;

                    if (targetType == 0) {
                        if (_isReady && _queue[targetAddr] != 0) {
                            staking(targetAddr);
                        }
                        _addOwnership(targetAddr); //가입
                    } else if (targetType == 1) {
                        //set sell
                        //판매등록
                        _setTrade(
                            _suggestion[_idx].data.nftIdx,
                            targetPrice,
                            1
                        );
                    } else if (targetType == 2) {
                        //set rent
                        //대여등록
                        _setTrade(
                            _suggestion[_idx].data.nftIdx,
                            targetPrice,
                            2
                        );
                    } else if (targetType == 3) {
                        //buy
                        //구매 target 등록
                        _isReady = true;
                        _setTarget(
                            _suggestion[_idx].data.target,
                            _suggestion[_idx].data.idx,
                            targetPrice,
                            1,
                            address(0x0),
                            0
                        );
                    } else if (targetType == 4) {
                        //대여 target 등록
                        _isReady = true;
                        _setTarget(
                            _suggestion[_idx].data.target,
                            _suggestion[_idx].data.idx,
                            targetPrice,
                            2,
                            address(0x0),
                            0
                        );
                    } else if (targetType == 5) {
                        //등록 취소
                        address cancelTarget = _suggestion[_idx].data.target;
                        uint256 cancelId = _suggestion[_idx].data.idx;
                        (bool checkCancel, ) = address(cancelTarget).call(
                            abi.encodeWithSignature("cancel(uint256)", cancelId)
                        );
                        require(checkCancel, "Coffer: Cancel fail");
                        _allocateNft[cancelTarget][cancelId] = 0;
                        _nfts[cancelId].option = 0;
                    } else if (targetType == 6) {
                        //target 취소
                        _isReady = false;
                        _setTarget(address(0), 0, 0, 0, address(0x0), 0);
                    }

                    emit pass(targetType, _idx);
                }
            } else {
                targetDisagree += _voteNum;
                if (targetDisagree >= _base) {
                    //reject
                    targetState = 1;

                    if (targetType == 0) {
                        //join
                        //임시 stake 금액 반환
                        if (_queue[targetAddr] != 0) {
                            uint256 _tempVal = _queue[targetAddr];
                            (bool check_, ) = payable(targetAddr).call{
                                value: _tempVal
                            }("");
                            require(check_, "Coffer: Return stake fail");
                            _queue[targetAddr] = 0;
                        }
                    }
                    //나머지는 처리할것 없음

                    emit reject(targetType, _idx);
                }
            }
        }
    }

    //거래하려는 nft setting start
    //구매 혹은 대여하고자 하는 nft 등록
    function _setTarget(
        address _collection,
        uint256 _tokenId,
        uint256 _price,
        uint8 _option,
        address _target,
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
        _targetNft.stake[_target] = stake_;
        _targetNft.joinAddr.push(_target);

        emit set_target(_collection, _tokenId, _price, _option);
    }

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
        _totalBalance[msg.sender] -= _price;
        _totalStake -= _price;
    }

    //개인이 소유한 nft의 소유권을 공동 wallet으로 이전
    function transferNft(
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) public onlyOwner {
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
        _nfts[idx].stake[msg.sender] = _price;
        _nfts[idx].price = _price;
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
            "Coffer: Invalid collection address"
        );
        require(
            _nfts[listIdx].info.tokenId != 0,
            "Coffer: Invalid tokenId"
        );
        require(option == 1 || option == 2, "Coffer: Invalid option");
        require(_nfts[listIdx].option != 2, "Coffer: Can not trade rental nft"); //대여중인 nft는 거래 x
        //_nfts[listIdx].price = price; //재 설정한 가격으로 변경
        address tradeTarget = _nfts[listIdx].info.collection;
        uint256 tradeId = _nfts[listIdx].info.tokenId;
        if (option == 1) {
            (bool check, ) = address(tradeTarget).call(
                abi.encodeWithSignature("sell(uint256,uint256)", tradeId, price)
            );
            require(check, "Coffer: Sell fail");
            _nfts[listIdx].option = 1;
            //_burn(listIdx);
        } else {
            (bool check, ) = address(tradeTarget).call(
                abi.encodeWithSignature("rent(uint256,uint256)", tradeId, price)
            );
            require(check, "Coffer: Sell fail");
            _nfts[listIdx].option = 2;
        }
        _allocateNft[tradeTarget][tradeId] = listIdx;
        emit set_trade(listIdx, price, option);
    }
}

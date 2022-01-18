// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./multiOwner.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract coffer is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private nftIdx;   
    Counters.Counter private suggestionIdx;
    //wallet에서 소유하고있는 nft info
    struct info{
        address collection;
        uint256 tokenId;
    }

    struct suggestion{
        bytes8 _option;//ADD,DEL,CHANGE
        bytes16 _types;//types array option
        address _target;
        uint32 _totalAccept;//총 찬성
        uint32 _totalReject;//총 반대
        uint256 _date;//제안 등록시간
        bool _valid;
    }

    address nftAddress;
    uint256 nftPrice;
    //string[] types = ["JOIN","BUY","RENT","SELL","CANCEL"];
    mapping(address => uint256) private stake;//누가 얼마의 지분을 가지는가
    mapping(uint256 => info) private nftList;
    mapping(address => bool) private pendingUser;
    mapping(uint256 => suggestion) private suggestions;

    mapping(address => uint256) private tempStake;
    uint256 totalStake;

    event _suggest(string _option,string _type,uint256 _suggestionIdx);
    event delNft(uint256 indexed _tokenId,string  _type);
    event accept(string _type, address indexed _target);
    event reject(string _type, address indexed _target);
    event endSuggest(uint256 indexed idx, string reason);
    constructor() payable {
        addOwnership(msg.sender);//처음 nft구매 제안자를 owner로 등록
        addOwnership(address(this));
    }


//method 없이 순수 ether만 전송되었을 때
    receive() external payable{
        require(false,"Coffer: Must has data");
    }

    //개인이 소유한 nft의 소유권을 공동 wallet으로 이전
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

//ether 지불해서 구매 또는 대여 
    function _payment(address _collection, uint256 _tokenId, uint256 price, uint256 option) internal onlyOwner{
        require(totalStake >= price,"Coffer: Not enough ether");
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
        emit delNft(_tokenId,"JOIN");
    }

//suggestion 작성
    function _newSuggestion(bytes8  _op,bytes16  _ty, address target ) internal onlyOwner view returns(suggestion memory){
        return suggestion(_op,_ty,target,0,0,block.timestamp,true);
    }

//wallet 참여 요청 => ether를 staking 하면서 들어온다. => 임시 staking에 저장되어 있다가, reject 되면 반환
    function joinRequest() public payable{
        require(msg.sender != address(0),"Coffer: Not a address");
        require(!isOwner(msg.sender),"Coffer: Already join this coffer");
        require(!pendingUser[msg.sender],"Coffer: Already in pending");
        pendingUser[msg.sender] = true;
        tempStake[msg.sender] = msg.value;
        //제안 등록
        suggestionIdx.increment();
        suggestions[suggestionIdx.current()] = _newSuggestion("","JOIN",msg.sender);
        emit _suggest("","JOIN",suggestionIdx.current());
    }

/*JOIN 시작*/
//가입 승인

//가입할때 가격 만족하면 바로 구매, 구매하려는 nft는 한번에 하나만 설정하기

    function _acceptJoin(address target) internal onlyOwner{
        //실제로 통과했는지 검사
        totalStake += tempStake[target];
        pendingUser[target] = false;
        addOwnership(target);
        emit accept("JOIN",target);
    }

//가입 반대
    function _rejectJoin(address target) internal  onlyOwner{
        //실제로 반대했는지 검사
        (bool check,) = payable(target).call{value:tempStake[target]}("");
        require(check,"Coffer: Return staking ether fail");
        tempStake[target] = 0;
        pendingUser[target] = false;
        emit reject("JOIN",target);
    }


/*JOIN 끝*/

//vote router
function vote(uint256 _suggestionIdx,bool _vote) public onlyOwner payable {
    
    require(_suggestionIdx >0,"Coffer: Invalid suggestion index");    
    uint256 totalOwner = getTotal();
    (bool check1, uint256 stdLine) = SafeMath.tryDiv(totalOwner,3);
    require(check1,"Coffer: Stdline line error");

    (bool checkUpperLine, uint256 upperLine) = SafeMath.tryMul(stdLine,2);
    require(checkUpperLine,"Coffer: Upper line line error");
    upperLine = upperLine + 1;// 2/3+1 이어야 승인

    uint256 lowerLine = stdLine;
    
    require(suggestions[_suggestionIdx]._valid,"Coffer: Invalid vote");

    if(suggestions[_suggestionIdx]._date + 1 days <= block.timestamp){//투표 제한시간 하루
        suggestions[_suggestionIdx]._valid = false;
        emit endSuggest(_suggestionIdx,"Time out");
    }
    else{
        if(keccak256(abi.encodePacked(suggestions[_suggestionIdx]._types)) == keccak256(abi.encodePacked(bytes16("JOIN")))){
            //join vote
            if(_vote){
                suggestions[_suggestionIdx]._totalAccept +=1;
                if(totalOwner < 3 || suggestions[_suggestionIdx]._totalAccept >= upperLine){//전체 가입자가 3명 미만의 경우 아무나 승인해도 가입가능, 3인 이상인경우 2/3+1 동의해야함
                    _acceptJoin(suggestions[_suggestionIdx]._target);
                }
            }else{
                suggestions[_suggestionIdx]._totalReject +=1;
                if(suggestions[_suggestionIdx]._totalReject == totalOwner ||suggestions[_suggestionIdx]._totalReject >= lowerLine){
                    _rejectJoin(suggestions[_suggestionIdx]._target);
                }
            }

        }else{
            require(false,"Coffer: Wrong type");
        }
    }
    

}

//최신 nft id 값 return
    function totalSupply() public view returns(uint256){
        return nftIdx.current();
    }


    //request -> vote/대기상태 -> 승인/기각


    //투표, 지분, 지분  뺐을때 패널티, 수익분배 ....

}
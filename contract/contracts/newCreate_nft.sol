// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./multiOwner.sol";
import "./trade.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GGanbuCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => bool) private auction;

    mapping(uint256 => bool) private isRental;
    mapping(uint256 => address) private rental;

    mapping(uint256 => uint256) private price;
    string private collectionURI;

    event _rental(address collection, uint256 indexed tokenId, uint256 price);
    event _sell(address collection, uint256 indexed tokenId, uint256 price);
    event _trade(address collection, uint256 indexed tokenId, uint256 price);
    event _rented(address collection, uint256 indexed tokenId, uint256 price);
    event _cancel(address collection, uint256 indexed tokenId);
    event _return(address collection, uint256 indexed tokenId);
    event burnNft(uint256 tokenId);

    constructor(
        string memory collectionName,
        string memory collectionSymbol,
        string memory _collectionURI
    ) payable ERC721(collectionName, collectionSymbol) {
        collectionURI = _collectionURI;
    }

    function mintNFT(string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    function getCollectionURI() public view returns (string memory) {
        return collectionURI;
    }

    function burn(uint256 tokenId) public onlyOwner {
        require(
            msg.sender == ownerOf(tokenId),
            "Collection: This address is not owner"
        ); //해당 nft의 owner만 삭제 할 수 있다.
        ERC721URIStorage._burn(tokenId);
        emit burnNft(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    //대여
    function rent(uint256 tokenId, uint256 _price) public {
        require(
            msg.sender == ownerOf(tokenId),
            "Collection: This address is not owner"
        );
        require(!auction[tokenId], "Collection: This nft already on sale");
        require(!isRental[tokenId], "Collection: This nft is rented");
        isRental[tokenId] = true;
        price[tokenId] = _price;
        emit _rental(address(this), tokenId, _price);
    }

    function returnNFT(uint256 tokenId) public {
        require(
            msg.sender == rental[tokenId],
            "Collection: This address is not rented"
        );
        require(isRental[tokenId], "Collection: This nft is not rented");
        require(!auction[tokenId], "Collection: This nft is on sale");
        isRental[tokenId] = false;
        rental[tokenId] = address(0);
        price[tokenId] = 0;
        emit _return(address(this), tokenId);
    }

    //판매
    function sell(uint256 tokenId, uint256 _price) public {
        require(
            msg.sender == ownerOf(tokenId),
            "Collection: This address is not owner"
        );
        require(!auction[tokenId], "Collection: This nft already on sale");
        require(!isRental[tokenId], "Collection: This nft is rented");
        auction[tokenId] = true;
        price[tokenId] = _price;
        trade tradeContract = new trade();
        _approve(address(tradeContract), tokenId);
        emit _sell(address(this), tokenId, _price);
    }

    function cancel(uint256 tokenId) public {
        require(
            msg.sender == ownerOf(tokenId),
            "Collection: This address is not owner"
        );
        require(!isRental[tokenId], "Collection: This nft is rented");
        require(auction[tokenId], "Collection: This nft is not on sale");
        auction[tokenId] = false;
        price[tokenId] = 0;
        emit _cancel(address(this), tokenId);
    }

    receive() external payable {
        require(false, "Collection: Trasaction must have data");
    }

    function payment(uint256 option, uint256 tokenId) public payable {
        require(option == 1 || option == 2, "Collection: Invalid option");
        require(
            auction[tokenId] || isRental[tokenId],
            "Collection: This nft is not on sale or not set rental"
        );
        require(price[tokenId] != 0, "Collection: Price error");
        require(msg.value == price[tokenId], "Collection: Price is not same");
        if (option == 1) {
            //sell
            _buy(tokenId);
            emit _trade(address(this), tokenId, price[tokenId]);
        } else {
            //rent
            _setRented(tokenId);
            emit _rented(address(this), tokenId, price[tokenId]);
        }
    }

    function _buy(uint256 tokenId) internal {
        require(auction[tokenId], "Collection: This nft is not on sale");

        (bool checkSend, ) = payable(ownerOf(tokenId)).call{
            value: price[tokenId]
        }(""); //from에게 금액 전송
        require(checkSend, "Collection: Trande send Eth fail");

        address tradeContract = getApproved(tokenId);
        trade tempTrade = trade(tradeContract);
        tempTrade.transfer(address(this), ownerOf(tokenId), tokenId);
        auction[tokenId] = false;
    }

    function _setRented(uint256 tokenId) internal {
        require(isRental[tokenId], "Collection: This nft is not on rental");

        (bool checkSend, ) = payable(ownerOf(tokenId)).call{
            value: price[tokenId]
        }(""); //from에게 금액 전송
        require(checkSend, "Collection: Trande send Eth fail");

        rental[tokenId] = msg.sender;
    }

    function getIsSelling(uint256 tokenId) public view returns (bool) {
        return auction[tokenId];
    }
}

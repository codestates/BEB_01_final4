// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

contract trade {
    bool private valid = true;

    constructor() {}

    modifier isValid() {
        require(valid, "Trade: Not valid");
        _;
    }

    function transfer(
        address collection,
        address owner,
        uint256 tokenId
    ) public isValid {
        (bool check, ) = collection.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                owner,
                msg.sender,
                tokenId
            )
        );
        require(check, "Trade: TransferFrom fail");
        valid = false;
    }
}

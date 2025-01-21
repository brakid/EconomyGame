// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IToken is IERC20 {
    function decimals() external view returns (uint8);
    function mint(uint256 _value) external;
    function burn(uint256 _value) external;
}

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IHarvester is IERC721 {
    function mint() external;
    function burn(uint256 _tokenId) external;
    function getResource() external view returns (address);
    function getAvailableResources(uint256 _tokenId) external view returns (uint256);
    function withdraw(uint256 _tokenId) external;
}

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IAggregatedHarvester is IHarvester, IERC721Receiver {
    function addHarvester(uint256 _tokenId, uint256 _harvesterTokenId) external;
}

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Mintable is Ownable {
    event MinterChanged(address indexed minter, bool indexed added);

    mapping(address => bool) private minters;

    constructor() Ownable(msg.sender) {}

    modifier onlyMinters() {
        require(minters[msg.sender], "Minters only");
        _;
    }

    function addMinter(address _minter) public onlyOwner {
        require(_minter != address(0), "Zero address not allowed as minter");
        minters[_minter] = true;
        emit MinterChanged(_minter, true);
    }

    function removeMinter(address _minter) public onlyOwner {
        minters[_minter] = false;
        emit MinterChanged(_minter, false);
    }
}
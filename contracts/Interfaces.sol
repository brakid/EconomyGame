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
    function mint() external returns (uint256);
    function burn(uint256 _tokenId) external;
    function getResource() external view returns (IToken);
    function getAvailableResources(uint256 _tokenId) external view returns (uint256);
    function withdraw(uint256 _tokenId) external returns (uint256);
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

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ERC721Ownable is ERC721 {
    modifier onlyTokenOwner(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Token owner only");
        _;
    }
}

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ResourceToken is ERC20, IToken, Mintable {
    uint8 private immutable decimal;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol) Mintable() {
        decimal = _decimals;
    }

    function decimals() public override(ERC20, IToken) view returns (uint8) {
        return decimal;
    }

    function mint(uint256 _value) external onlyMinters {
        _mint(msg.sender, _value);
    }

    function burn(uint256 _value) external onlyMinters {
        _burn(msg.sender, _value);
    }
}

interface IExchange {
    function getResource() external view returns (IToken);
    function buy() external payable;
    function sell(uint256 _amountResource) external;
}
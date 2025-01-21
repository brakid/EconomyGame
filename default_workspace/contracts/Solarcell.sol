// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IToken, IHarvester, Mintable} from "./Interfaces.sol";

contract Solarcell is ERC721, IHarvester, Mintable {
    IToken private immutable resource;
    uint256 public nextTokenId = 0;
    mapping(uint256 => uint256) private lastTimestamp;

    constructor(address _resource) ERC721("Solarcell", "SC") Mintable() {
        resource = IToken(_resource);
        addMinter(msg.sender);
    }

    function getResource() external view returns (address) {
        return address(resource);
    }

    function mint() external onlyMinters() {
        _mint(msg.sender, nextTokenId);
        lastTimestamp[nextTokenId] = block.timestamp;
        nextTokenId += 1;
    }

    function _getAvailableResources(uint256 _tokenId) private view returns (uint256) {
        require(ownerOf(_tokenId) == msg.sender, "Only owner can withdraw");
        return (block.timestamp - lastTimestamp[_tokenId]) * (10**resource.decimals()); // one token per second
    }

    function getAvailableResources(uint256 _tokenId) external view returns (uint256) {
        return _getAvailableResources(_tokenId);
    }

    function withdraw(uint256 _tokenId) external {
        uint256 available = _getAvailableResources(_tokenId);
        resource.mint(available);
        lastTimestamp[_tokenId] = block.timestamp;
        require(resource.transfer(msg.sender, available), "Transfer failed");
    }
}
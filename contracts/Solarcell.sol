// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IToken, IHarvester, Mintable, ERC721Ownable} from "./Interfaces.sol";

contract Solarcell is ERC721, ERC721Ownable, IHarvester, Mintable {
    IToken private immutable resource;
    uint256 private immutable factor;
    uint256 public nextTokenId;
    mapping(uint256 => uint256) private lastTimestamp;

    constructor(address _resource) ERC721("Solarcell", "SLC") Mintable() {
        require(_resource != address(0), "Zero address not allowed");
        resource = IToken(_resource);
        factor = 10**resource.decimals();
        addMinter(msg.sender);
    }

    function getResource() external view returns (IToken) {
        return resource;
    }

    function mint() external onlyMinters() returns (uint256) {
        _mint(msg.sender, nextTokenId);
        lastTimestamp[nextTokenId] = block.timestamp;
        return nextTokenId++;
    }

    function burn(uint256 _tokenId) external onlyTokenOwner(_tokenId) {
        _burn(_tokenId);
    }

    function getAvailableResources(uint256 _tokenId) external view returns (uint256) {
        ownerOf(_tokenId); // check tokenId exists
        return (block.timestamp - lastTimestamp[_tokenId]) * factor / 3600; // one token per hour
    }

    function withdraw(uint256 _tokenId) external onlyTokenOwner(_tokenId) returns (uint256) {
        uint256 available = (block.timestamp - lastTimestamp[_tokenId]) * factor / 3600; // one token per hour
        resource.mint(available);
        lastTimestamp[_tokenId] = block.timestamp;
        require(resource.transfer(msg.sender, available), "Transfer failed");
        return available;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./IResourceGenerator.sol";
import {IEnergyToken} from "./EnergyToken.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Solarcell is IResourceGenerator, ERC721, Ownable {
  IEnergyToken private resource;
  uint256 private nextTokenId;
  mapping(uint256 => uint8) private tokenIdToTier;
  mapping(uint256 => uint256) private tokenIdToLastRetrieveTimestamp;

  constructor(address _resourceAddress) Ownable(msg.sender) ERC721("Solarcell", "SC") {
    require(_resourceAddress != address(0), "Expecting resource not be the be zero address");
    resource = IEnergyToken(_resourceAddress);
    nextTokenId = 1;
  }

  function mint(address _receiver) public onlyOwner {
    require(_receiver != address(0), "Zero address not allowed as receiver");
    _mint(_receiver, nextTokenId);
    tokenIdToTier[nextTokenId] = 1;
    tokenIdToLastRetrieveTimestamp[nextTokenId] = block.timestamp;
    nextTokenId += 1;
  }

  function burn(uint256 _tokenId) public {
    require(ownerOf(_tokenId) == msg.sender, "Only the instance holder can burn the instance");
    _burn(_tokenId);
  }

  function getResource() external view returns (address) {
    return address(resource);
  }

  function _getAvailableResources(uint256 _tokenId) private view returns (uint256) {
    ownerOf(_tokenId);
    uint256 hoursDifference = (block.timestamp - tokenIdToLastRetrieveTimestamp[_tokenId]) / 3600;
    return hoursDifference * tokenIdToTier[_tokenId];
  }

  function getAvailableResources(uint256 _tokenId) public view returns (uint256) {
    return _getAvailableResources(_tokenId);
  }
  
  function retrieve(uint256 _tokenId) external {
    require(ownerOf(_tokenId) == msg.sender, "Only the instance holder can retrieve resources");
    uint256 available = _getAvailableResources(_tokenId);
    resource.mint(available);
    resource.transfer(msg.sender, available);
    tokenIdToLastRetrieveTimestamp[_tokenId] = block.timestamp;
  }

  function upgrade(uint256 tokenId) external {
    revert();
  }

  function getTier(uint256 _tokenId) external view returns (uint256) {
    ownerOf(_tokenId);
    return tokenIdToTier[_tokenId];
  }
}
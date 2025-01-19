// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IResourceGenerator is IERC721 {
  function getResource() external view returns (address);
  function getAvailableResources(uint256 _tokenId) external view returns (uint256);
  function retrieve(uint256 _tokenId) external;
  function upgrade(uint256 _tokenId) external;
  function getTier(uint256 _tokenId) external view returns (uint256);
}

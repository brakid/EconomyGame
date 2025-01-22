// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {IToken, IHarvester, IAggregatedHarvester, Mintable, ERC721Ownable} from "./Interfaces.sol";

contract Solararray is IAggregatedHarvester, ERC721, Mintable, ERC721Holder, ERC721Ownable {
    uint256 public constant maxHarvesters = 100;
    IHarvester private immutable harvester;
    uint256 public nextTokenId;
    mapping(uint256 => uint256[maxHarvesters]) private harvesters;
    mapping(uint256 => uint256) private harvesterCounts;

    constructor(address _harvester) ERC721("Solararray", "SLA") ERC721Holder() Mintable() {
        require(_harvester != address(0), "Zero address not allowed");
        harvester = IHarvester(_harvester);
        addMinter(msg.sender);
    }

    function getResource() external view returns (address) {
        return harvester.getResource();
    }

    function mint() external onlyMinters returns (uint256) {
        _mint(msg.sender, nextTokenId);
        return nextTokenId++;
    }

    function burn(uint256 _tokenId) external onlyOwner {
        _burn(_tokenId);
    }

    function addHarvester(uint256 _tokenId, uint256 _harvesterTokenId) external onlyTokenOwner(_tokenId) {
        require(harvester.ownerOf(_harvesterTokenId) == msg.sender, "Token owner only");
        harvester.safeTransferFrom(msg.sender, address(this), _harvesterTokenId);
        harvesters[_tokenId][harvesterCounts[_tokenId]++] = _harvesterTokenId;
    }

    function getAvailableResources(uint256 _tokenId) external view returns (uint256) {
        uint256 resources;
        uint256 harvesterCount = harvesterCounts[_tokenId];
        for (uint256 index; index < harvesterCount; index++) {
            resources += harvester.getAvailableResources(harvesters[_tokenId][index]);
        }

        return resources;
    }

    function withdraw(uint256 _tokenId) external onlyTokenOwner(_tokenId) returns (uint256) {
        uint256 resources;
        uint256 harvesterCount = harvesterCounts[_tokenId];
        for (uint256 index; index < harvesterCount; index++) {
            resources += harvester.withdraw(harvesters[_tokenId][index]);
        }

        require(IToken(harvester.getResource()).transfer(msg.sender, resources), "Transfer failed");
        return resources;
    }
}
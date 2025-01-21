// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {IToken, IHarvester, IAggregatedHarvester, Mintable} from "./Interfaces.sol";

contract Solararray is IAggregatedHarvester, ERC721, Mintable, ERC721Holder {
    IHarvester private immutable harvester;
    uint256 public nextTokenId = 0;
    mapping(uint256 => uint256[]) private harvesters;

    constructor(address _harvester) ERC721("Solararray", "SA") ERC721Holder() Mintable() {
        harvester = IHarvester(_harvester);
        addMinter(msg.sender);
    }

    function getResource() external view returns (address) {
        return harvester.getResource();
    }

    function mint() external onlyMinters {
        _mint(msg.sender, nextTokenId);
        nextTokenId += 1;
    }

    function addHarvester(uint256 _tokenId, uint256 _harvesterTokenId) external {
        require(ownerOf(_tokenId) == msg.sender, "Only owner can add harvester");
        require(harvester.ownerOf(_harvesterTokenId) == msg.sender, "Only owner can add harvester");
        harvester.safeTransferFrom(msg.sender, address(this), _harvesterTokenId);
        harvesters[_tokenId].push(_harvesterTokenId);
    }

    function _getAvailableResources(uint256 _tokenId) private view returns (uint256) {
        require(ownerOf(_tokenId) == msg.sender, "Only owner can withdraw");
        uint256 resources = 0;
        for (uint256 index = 0; index < harvesters[_tokenId].length; index++) {
            resources += harvester.getAvailableResources(harvesters[_tokenId][index]);
        }

        return resources;
    }

    function getAvailableResources(uint256 _tokenId) external view returns (uint256) {
        return _getAvailableResources(_tokenId);
    }

    function withdraw(uint256 _tokenId) external {
        uint256 available = _getAvailableResources(_tokenId);
        for (uint256 index = 0; index < harvesters[_tokenId].length; index++) {
            harvester.withdraw(harvesters[_tokenId][index]);
        }

        require(IToken(harvester.getResource()).transfer(msg.sender, available), "Transfer failed");
    }
}
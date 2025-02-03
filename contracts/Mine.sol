// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IToken, IMine} from "./Interfaces.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Mine is IMine, Ownable {
    event MiningLock(address indexed sender, uint256 indexed lockedUntil);

    IToken private immutable energy;
    IToken private immutable resource;
    uint256 private immutable energyAmount;
    uint256 private immutable resourceAmount;

    mapping(address => uint256) private miningLockTimestamp;
    
    constructor(address _energy, address _resource) Ownable(msg.sender) {
        require(_energy != address(0), "Zero address not allowed");
        energy = IToken(_energy);
        require(_resource != address(0), "Zero address not allowed");
        resource = IToken(_resource);
        require(_energy != _resource, "Resource needs to be different from Energy token");
        energyAmount = 10 * (10**energy.decimals()); // 10 Energy = 1 Resource
        resourceAmount = 10**resource.decimals();
    }

    function getResource() external view returns (IToken) {
        return resource;
    } 

    function mine() external {
        require(miningLockTimestamp[msg.sender] == 0, "Mining already started");
        require(energy.transferFrom(msg.sender, address(this), energyAmount), "Transfer failed");
        energy.burn(energyAmount);
        uint256 lockedUntil = block.timestamp + 1 hours;
        miningLockTimestamp[msg.sender] = lockedUntil;
        emit MiningLock(msg.sender, lockedUntil);
    }

    function retrieve() external {
        require(miningLockTimestamp[msg.sender] != 0, "No mining started");
        require(miningLockTimestamp[msg.sender] <= block.timestamp, "Mining not finished");
        resource.mint(resourceAmount);
        require(resource.transfer(msg.sender, resourceAmount), "Transfer failed");
        delete miningLockTimestamp[msg.sender];
    }
}
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IToken, IMine} from "./Interfaces.sol";

contract MineRouter is Ownable {
    event MineRegistered(address indexed mine, address indexed resource);

    mapping(address => address) private registeredMines;

    constructor() Ownable(msg.sender) {}

    function addMine(address _mine) external onlyOwner {
        require(_mine != address(0), "Invalid mine");
        IMine mine = IMine(_mine);
        address resource = address(mine.getResource());
        require(registeredMines[resource] == address(0), "Mine for resource already registered");
        registeredMines[resource] = _mine;
        emit MineRegistered(_mine, resource);
    }

    function getMine(address _resource) external view returns (IMine) {
        require(_resource != address(0), "Invalid resource");
        address mine = registeredMines[_resource];
        require(mine != address(0), "No mine registered for resource");
        return IMine(mine);
    }
}
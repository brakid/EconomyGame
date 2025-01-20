// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {IEnergyToken} from "./EnergyToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* 
 * Energy formula:
 * 0 - 200 kcal -> kcal * 0.1 (max 20 ET)
 * 201 - 2000 kcal -> (kcal-200) * 0.05 (max 99 ET, total 110 ET)
 */

contract ProofOfExercise is Ownable {
  event Proof(address indexed user, uint256 indexed caloriesBurnt, uint256 indexed energyGranted);

  IEnergyToken private resource;

  constructor(address _resourceAddress) Ownable(msg.sender) {
    require(_resourceAddress != address(0), "Expecting resource not be the be zero address");
    resource = IEnergyToken(_resourceAddress);
  }

  function grantEnergy(address _receiver, uint256 _calories) public onlyOwner {
    require(_receiver != address(0), "Zero address not allowed as receiver");
    uint256 energy = 0;

    if (_calories <= 200) {
      energy = _calories / 10;
    } else {
      if (_calories <= 2000) {
        energy = 20 + (_calories - 200) / 20;
      } else {
        energy = 20 + (2000 - 200) / 20;
      }
    }
    require(energy > 0, "Not enough calories");
    resource.mint(energy);
    resource.transfer(_receiver, energy);
    emit Proof(_receiver, _calories, energy);
  }

  function getResource() external view returns (address) {
    return address(resource);
  }
}
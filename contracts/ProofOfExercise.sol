// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {IEnergyToken} from "./EnergyToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* 
 * Energy formula:
 * 0 - 200 kcal -> kcal * 0.01 (max 2 ET)
 * 201 - 2000 kcal -> (kcal-200) * 0.005 (max 9 ET, total 11 ET)
 */

contract ProofOfExercise is Ownable {
  event Proof(address indexed user, uint256 indexed caloriesBurnt, uint256 indexed energyGranted);

  uint256 constant DECIMALS = 10**18;

  IEnergyToken private resource;

  constructor(address _resourceAddress) Ownable(msg.sender) {
    require(_resourceAddress != address(0), "Expecting resource not be the be zero address");
    resource = IEnergyToken(_resourceAddress);
  }

  function grantEnergy(address _receiver, uint256 _calories) public onlyOwner {
    require(_receiver != address(0), "Zero address not allowed as receiver");
    uint256 energy = 0;

    if (_calories <= 200) {
      energy = (_calories * DECIMALS) / 100;
    } else {
      if (_calories <= 2000) {
        energy = (200 * DECIMALS) / 100 + ((_calories - 200) * DECIMALS) / 200;
      } else {
        energy = (200 * DECIMALS) / 100 + ((2000 - 200) * DECIMALS) / 200;
      }
    }
    resource.mint(energy);
    resource.transfer(_receiver, energy);
    emit Proof(_receiver, _calories, energy);
  }

  function getResource() external view returns (address) {
    return address(resource);
  }
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import {IToken} from "./Interfaces.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
 * Energy formula:
 * 0 - 200 kcal -> kcal * 0.1 (max 20.00 ET)
 * 201 - 2000 kcal -> (kcal-200) * 0.05 (max 99.00 ET, total 110.00 ET)
 */

contract ProofOfExercise is Ownable {
    event Proof(address indexed user, uint256 indexed caloriesBurnt, uint256 indexed energyGranted);

    IToken private resource;

    constructor(address _resource) Ownable(msg.sender) {
        require(_resource != address(0), "Zero address not allowed");
        resource = IToken(_resource);
    }

    function grantEnergy(address _receiver, uint256 _calories) public onlyOwner {
        require(_receiver != address(0), "Zero address not allowed");
        uint256 energy = 0;

        if (_calories <= 200) {
            energy = (_calories * 10 ** resource.decimals()) / 10;
        } else {
            if (_calories <= 2000) {
                energy =
                    (20 * (10 ** resource.decimals())) + ((_calories - 200) * (10 ** resource.decimals())) / 20;
            } else {
                energy = 110 * (10 ** resource.decimals());
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

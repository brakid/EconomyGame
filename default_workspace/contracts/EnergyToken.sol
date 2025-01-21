// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IToken, Mintable} from "./Interfaces.sol";

contract EnergyToken is ERC20, IToken, Mintable {
    constructor() ERC20("EnergyToken", "ET") Mintable() {}

    function decimals() public override(ERC20, IToken) pure returns (uint8) {
        return 2;
    }

    function mint(uint256 _value) external onlyMinters {
        _mint(msg.sender, _value);
    }

    function burn(uint256 _value) external onlyMinters {
        _burn(msg.sender, _value);
    }
}
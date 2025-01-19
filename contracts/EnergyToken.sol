// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IEnergyToken is IERC20 {
  event Minted(address indexed sender, uint256 indexed amount);
  event Burnt(address indexed sender, uint256 indexed amount);

  function addMinter(address _minter) external;
  function mint(uint256 amount) external;
  function burn(uint256 amount) external;
}

contract EnergyToken is ERC20, IEnergyToken, Ownable {
  mapping(address => bool) private allowedToMint;

  constructor() Ownable(msg.sender) ERC20("EnergyToken", "ET") {}

  function decimals() override public pure returns (uint8) {
    return 18;
  }

  function addMinter(address _minter) external onlyOwner() {
    require(_minter != address(0), "Zero address not allowed as minter");
    require(allowedToMint[_minter] == false, "Already added");
    allowedToMint[_minter] = true;
  }

  function mint(uint256 amount) external {
    require(allowedToMint[msg.sender] == true, "Sender not allowed to mint");
    _mint(msg.sender, amount);
    emit Minted(msg.sender, amount);
  }

  function burn(uint256 amount) external {
    _burn(msg.sender, amount);
    emit Burnt(msg.sender, amount);
  }
}
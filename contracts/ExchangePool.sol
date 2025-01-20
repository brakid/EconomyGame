// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExchangePool is Ownable {
  event Trade(address indexed sender, address indexed resource, bool indexed sale, uint256 amountSol, uint256 amountResource);

  uint256 public constant MAX_FEE = 1 gwei;
  uint256 public constant MIN_PRICE_PER_SOL = 10;
  uint256 public constant MAX_PRICE_PER_SOL = 190;
  uint256 public pricePerSol;
  uint256 public fee;
  uint256 public collectableFees;
  IERC20 private immutable resource;

  constructor(address _resource, uint256 _fee) Ownable(msg.sender) {
    require(_resource != address(0), "Invalid resource");
    resource = IERC20(_resource);
    setFee(_fee);
    pricePerSol = 100;
    collectableFees = 0;
  }

  function setFee(uint256 _fee) public onlyOwner {
    require(_fee <= MAX_FEE, "Invalid fee");
    fee = _fee;
  }

  function getResource() public view returns (address) {
    return address(resource);
  }

  receive() external payable { // buy resources
    if (msg.sender == owner()) {
      return;
    }

    require(msg.value > fee, "Amount does not cover fees");
    uint256 amountLessFees = msg.value - fee;
    collectableFees += fee;
    uint256 fullSol = amountLessFees / 1 ether;
    uint256 amountResource = fullSol * pricePerSol;
    require(amountResource > 0, "No full resource token");
    require(resource.balanceOf(address(this)) >= amountResource, "Not enough resource tokens available");
    
    if (pricePerSol < amountResource) {
      pricePerSol = MIN_PRICE_PER_SOL;
    } else {
      pricePerSol -= amountResource;
      if (pricePerSol < MIN_PRICE_PER_SOL) {
        pricePerSol = MIN_PRICE_PER_SOL;
      }
    }

    require(resource.transfer(msg.sender, amountResource), "Resource transfer failed");
    emit Trade(msg.sender, address(resource), false, amountLessFees, amountResource);
  }

  function sell(uint256 _amountResource) public {
    uint256 fullSol = _amountResource / pricePerSol;
    require(fullSol > 0, "No full Sol");
    uint256 amountSol = fullSol * 1 ether;
    uint256 amountLessFees = amountSol - fee;
    collectableFees += fee;
    require(address(this).balance >= amountSol, "Not enough Sol available");

    pricePerSol += _amountResource;
    if (pricePerSol > MAX_PRICE_PER_SOL) {
      pricePerSol = MAX_PRICE_PER_SOL;
    }

    require(resource.transferFrom(address(msg.sender), address(this), _amountResource), "Resource transfer failed");
    require(payable(msg.sender).send(amountLessFees), "Sending Sol failed");
    emit Trade(msg.sender, address(resource), true, amountLessFees, _amountResource);
  }

  function withdraw() public onlyOwner {
    require(address(this).balance >= collectableFees, "Not enough Sol available");
    require(payable(msg.sender).send(collectableFees), "Sending Sol failed");
    collectableFees = 0;
  }
}
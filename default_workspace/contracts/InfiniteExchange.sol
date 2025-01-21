// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IToken} from "./Interfaces.sol";

contract InfiniteExchange is Ownable {
    IToken private immutable resource;
    uint256 private constant FEE = 1 gwei;
    uint256 public accruedFees = 0;

    constructor(address _resource) Ownable(msg.sender) {
        resource = IToken(_resource);
    }

    function getResource() public view returns (address) {
        return address(resource);
    }

    function buy() external payable {
        require(msg.value > FEE, "Not covering fees");
        uint256 amount = msg.value - FEE;
        uint tokens = (amount * (10**resource.decimals())) / 1 ether;
        require(tokens > 0, "Not enough funds");
        accruedFees += FEE;
        resource.mint(tokens);
        require(resource.transfer(msg.sender, tokens), "Transfer failed");
    }

    function sell(uint256 _amount) external {
        require(_amount > 0, "Not enough funds");
        uint256 etherAmount = (_amount * 1 ether) / (10**resource.decimals());
        require(etherAmount > FEE, "Not covering fees");
        uint amount = etherAmount - FEE;
        accruedFees += FEE;
        require(resource.allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        require(resource.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        resource.burn(_amount);
        require(address(this).balance > amount, "Not enough ether funds");
        require(payable(msg.sender).send(amount), "Failed to send Ether");
    }

    function withdraw() public onlyOwner {
        require(address(this).balance >= accruedFees, "Not enough ether funds");
        accruedFees = 0;
        require(payable(msg.sender).send(accruedFees), "Failed to send Ether");
    }
}
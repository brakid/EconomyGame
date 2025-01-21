// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IToken} from "./Interfaces.sol";

contract InfiniteExchange is Ownable {
    event Trade(address indexed sender, address resource, bool selling, uint256 amountSol, uint256 amountResource);

    IToken private immutable resource;
    uint256 public fee;
    uint256 public accruedFees = 0;

    uint256 public constant MAX_FEE = 1 gwei;
    uint256 public constant MIN_PRICE_PER_SOL = 10;
    uint256 public constant MAX_PRICE_PER_SOL = 190;
    uint256 public pricePerSol;

    constructor(address _resource, uint256 _fee) Ownable(msg.sender) {
        require(_resource != address(0), "Zero address not allowed");
        resource = IToken(_resource);
        setFee(_fee);
        pricePerSol = 100;
    }

    function setFee(uint256 _fee) public onlyOwner {
        require(_fee <= MAX_FEE, "Invalid fee");
        fee = _fee;
    }

    function getResource() public view returns (address) {
        return address(resource);
    }

    function buy() external payable {
        require(msg.value > fee, "Amount does not cover fees");
        uint256 amountLessFees = msg.value - fee;
        accruedFees += fee;
        uint256 fullSol = (amountLessFees * (10**resource.decimals())) / 1 ether;
        uint256 amountResource = fullSol * pricePerSol;
        require(amountResource > 0, "Not enough funds");
        
        if (pricePerSol < (amountResource / (10**resource.decimals()))) {
            pricePerSol = MIN_PRICE_PER_SOL;
        } else {
            pricePerSol -= (amountResource / (10**resource.decimals()));
            if (pricePerSol < MIN_PRICE_PER_SOL) {
                pricePerSol = MIN_PRICE_PER_SOL;
            }
        }

        resource.mint(amountResource);
        require(resource.transfer(msg.sender, amountResource), "Transfer failed");
        emit Trade(msg.sender, address(resource), false, amountLessFees, amountResource);
    }

    function sell(uint256 _amountResource) external {
        require(_amountResource > 0, "Not enough funds");
        uint256 amountSol = (_amountResource * 1 ether) / (pricePerSol * (10**resource.decimals()));
        require(amountSol > 0, "No full Sol");
        uint256 amountLessFees = amountSol - fee;
        accruedFees += fee;
        require(address(this).balance >= amountSol, "Not enough Sol available");

        pricePerSol += (_amountResource / (10**resource.decimals()));
        if (pricePerSol > MAX_PRICE_PER_SOL) {
            pricePerSol = MAX_PRICE_PER_SOL;
        }

        require(resource.allowance(msg.sender, address(this)) >= _amountResource, "Insufficient allowance");
        require(resource.transferFrom(msg.sender, address(this), _amountResource), "Transfer failed");
        resource.burn(_amountResource);
        require(address(this).balance >= amountLessFees + accruedFees, "Not enough funds");
        require(payable(msg.sender).send(amountLessFees), "Failed to send funds");
        emit Trade(msg.sender, address(resource), true, amountLessFees, _amountResource);
    }

    function withdraw() public onlyOwner {
        require(address(this).balance >= accruedFees, "Not enough ether funds");
        accruedFees = 0;
        require(payable(msg.sender).send(accruedFees), "Failed to send Ether");
    }
}
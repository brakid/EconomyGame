// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IToken, IExchange} from "./Interfaces.sol";

contract InfiniteExchange is IExchange, Ownable {
    event Trade(address indexed sender, address resource, bool selling, uint256 amountSol, uint256 amountResource);

    IToken private immutable resource;
    uint256 private immutable factor;
    uint256 public fee;
    uint256 public accruedFees;
    uint256 public constant MAX_FEE = 1 gwei;
    uint256 public constant MIN_PRICE_PER_SOL = 10;
    uint256 public constant MAX_PRICE_PER_SOL = 190;
    uint256 public pricePerSol;

    constructor(address _resource) Ownable(msg.sender) {
        require(_resource != address(0), "Zero address not allowed");
        resource = IToken(_resource);
        factor = 10**resource.decimals();
        setFee(MAX_FEE);
        pricePerSol = 100;
    }

    function setFee(uint256 _fee) public onlyOwner {
        require(_fee <= MAX_FEE, "Invalid fee");
        fee = _fee;
    }

    function getResource() external view returns (IToken) {
        return resource;
    }

    function buy() external payable {
        require(msg.value > fee, "Amount does not cover fees");
        uint256 amountLessFees = msg.value - fee;
        accruedFees += fee;
        uint256 fullSol = (amountLessFees * factor) / 1 ether;
        uint256 amountResource = fullSol * pricePerSol;
        require(amountResource > 0, "Not enough funds");
        
        if (pricePerSol < (amountResource / factor)) {
            pricePerSol = MIN_PRICE_PER_SOL;
        } else {
            pricePerSol -= (amountResource / factor);
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
        uint256 amountSol = (_amountResource * 1 ether) / (pricePerSol * factor);
        require(amountSol > 0, "No full Sol");
        uint256 amountLessFees = amountSol - fee;
        accruedFees += fee;
        require(address(this).balance >= amountSol, "Not enough Sol available");

        pricePerSol += (_amountResource / factor);
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

    function withdraw() external onlyOwner {
        require(address(this).balance >= accruedFees, "Not enough ether funds");
        require(payable(msg.sender).send(accruedFees), "Failed to send Ether");
        delete accruedFees;
    }
}
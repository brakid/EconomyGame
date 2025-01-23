// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IToken, IExchange} from "./Interfaces.sol";

contract ExchangeRouter is Ownable {
    mapping(address => address) private registeredExchanges;

    constructor() Ownable(msg.sender) {}

    function addExchange(address _exchange) external onlyOwner {
        require(_exchange != address(0), "Invalid exchange");
        IExchange exchange = IExchange(_exchange);
        address resource = address(exchange.getResource());
        require(registeredExchanges[resource] == address(0), "Exchange for resource already registered");
        registeredExchanges[resource] = _exchange;
    }

    function getExchange(address _resource) external view returns (IExchange) {
        require(_resource != address(0), "Invalid resource");
        address exchange = registeredExchanges[_resource];
        require(exchange != address(0), "No exchange registered for resource");
        return IExchange(exchange);
    }
}
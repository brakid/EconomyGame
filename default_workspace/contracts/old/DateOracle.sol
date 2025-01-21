// SPDX-License-Identifier: GPL-3.0

import "./IDateOracle.sol";

pragma solidity >=0.8.2 <0.9.0;

contract DateOracle is IDateOracle {
    event DateUpdated(address sender, uint256 dateTimestamp);

    address immutable owner;
    uint256 dateTimestamp = 0;
    
    constructor() {
        owner = msg.sender;
    }

    function fetchDate() external view override returns (uint256) {
        require(dateTimestamp > 0, "Date Timestamp not initialized");
        return dateTimestamp;
    }

    function update(uint256 _dateTimestamp) public {
        require(msg.sender == owner, "Only owner can update the timestamp");
        require(_dateTimestamp > dateTimestamp, "New date timestamp needs to be larger than previous date timestamp");
        dateTimestamp = _dateTimestamp;
        emit DateUpdated(msg.sender, dateTimestamp);
    }
}
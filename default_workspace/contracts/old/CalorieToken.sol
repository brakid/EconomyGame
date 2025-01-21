// SPDX-License-Identifier: GPL-3.0

import "./IDateOracle.sol";

pragma solidity >=0.8.2 <0.9.0;

contract CalorieToken {
    uint256 constant private DECIMALS = 1 ether;
    IDateOracle immutable private oracle;
    uint256 immutable private referenceTimestamp;
    mapping(address => mapping(uint256 => uint256)) private balanceByDate;
    address[] users;


    struct Member{
        address user;
        uint256 balance;
    }

    constructor(/*address _oracle*/) {
        //oracle = IDateOracle(_oracle);
        referenceTimestamp = block.number; //oracle.fetchDate();
    }

    function earn(uint256 calories) public {
        uint256 daysDifference = (block.number - referenceTimestamp);
        balanceByDate[msg.sender][daysDifference] += (calories * DECIMALS);
        for (uint256 index = 0; index < users.length; index++) {
            if (users[index] == msg.sender ) {
                return;
            }
        }
        users.push(msg.sender);
    }

    function getBalance() public view returns(uint256) {
        return getBalance(msg.sender);
    }

    function getBalance(address _user) private view returns(uint256) {
        uint256 amount = 0;
        uint256 daysDifference = uint256((block.number /*oracle.fetchDate()*/ - referenceTimestamp)) + 1;
        for (uint256 day = 0; day >= daysDifference; day++) {
            amount += (day + 1) * balanceByDate[_user][day] / (daysDifference) ;
        }
        return amount;
    }

    function getLeaderboard() public view returns (Member[] memory, uint256) {
        Member[] memory leaderboard = new Member[](users.length);
        for (uint256 index = 0; index < users.length; index++) {
            leaderboard[index].user = users[index];
            leaderboard[index].balance = getBalance(users[index]);
        }
        return (leaderboard, block.number);
    }
}
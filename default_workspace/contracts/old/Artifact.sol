// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Artifact {
    uint8 constant MAX_TIER = 5;

    address private owner;
    uint256 private nextTokenId = 1;
    mapping(uint256 => address) private tokenIdToOwner;
    mapping(uint256 => uint8) private tokenIdToTier;
    mapping(address => uint256) private balances;
    mapping(uint8 => uint256) private prices;
    uint256 private earnings;
    
    constructor() {
        owner = msg.sender;
        prices[1] = 1 ether; // initial buy
        prices[2] = 1 ether; // upgrade to tier 2
        prices[3] = 2 ether;
        prices[4] = 4 ether;
        prices[5] = 8 ether;
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        require(tokenIdToOwner[_tokenId] != address(0), "Token not owned");
        return tokenIdToOwner[_tokenId];
    }

    function tierOf(uint256 _tokenId) public view returns (uint8) {
        require(tokenIdToOwner[_tokenId] != address(0), "Token not owned");
        return tokenIdToTier[_tokenId];
    }

    function upgradeCost(uint256 _tokenId) public view returns (uint256) {
        require(tokenIdToOwner[_tokenId] != address(0), "Token not owned");
        require(tokenIdToTier[_tokenId] < MAX_TIER, "Maximum tier is 5, token cannot be upgraded");
        return prices[tokenIdToTier[_tokenId] + 1];
    }

    function balanceOf() public view returns (uint256) {
        return balances[msg.sender];
    }

    receive() external payable {
        uint256 amount = msg.value;
        balances[msg.sender] += amount;
    }

    function mint() public returns (uint256) {
        require(balances[msg.sender] >= prices[1], "Insufficient balance for mint");
        uint256 tokenId = nextTokenId;
        tokenIdToOwner[nextTokenId] = msg.sender;
        tokenIdToTier[nextTokenId] = 1;
        nextTokenId += 1;
        balances[msg.sender] -= prices[1];
        earnings += prices[1];
        return tokenId;
    }

    function upgrade(uint256 _tokenId) public {
        require(msg.sender == tokenIdToOwner[_tokenId], "Only owner can upgrade");
        uint256 cost = upgradeCost(_tokenId);
        require(balances[msg.sender] >= cost, "Insufficient balance for upgrade");
        balances[msg.sender] -= cost;
        tokenIdToTier[_tokenId] += 1;
        earnings += cost;
    }

    function withdraw() public {
        uint256 amount = address(this).balance;
        require(balances[msg.sender] < amount, "Not enough ether in contract");
        require(payable(msg.sender).send(balances[msg.sender]) == true, "Sending returned false");
    }

    function getEarnings() public view returns (uint256) {
        return earnings;
    }

    function withdrawEarnings() public {
        require(msg.sender == owner, "Only contract owner can withdraw earnings");
        uint256 amount = address(this).balance;
        require(earnings < amount, "Not enough ether in contract");
        require(payable(owner).send(earnings) == true, "Sending returned false");
        earnings = 0;
    }
}
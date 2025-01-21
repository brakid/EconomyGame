const CalorieToken = artifacts.require("CalorieToken");
const utils = require('web3-utils');
const { expect } = require("chai");

contract("CalorieToken", function (accounts) {
  it("expecting correct behavior", async function () {
    const token = await CalorieToken.deployed();
    await token.earn(100);
    const balance1 = await token.getBalance();
    expect(balance1.eq(utils.toWei("100", "ether")));
    await CalorieToken.deployed();
    const balance2 = await token.getBalance();
    expect(balance1.gt(balance2));
    await token.earn(100, { from: accounts[0] });
    const balance3 = await token.getBalance({ from: accounts[0] });
    expect(balance3.gt(balance2));
    const leaderboard = await token.getLeaderboard();
    expect(leaderboard[0].length == 1);
    await token.earn(100, { from: accounts[1] });
    const balance4 = await token.getBalance({ from: accounts[1] });
    expect(balance4.gt(balance2));
    const leaderboard2 = await token.getLeaderboard();
    expect(leaderboard2[0].length == 2);
  });
});

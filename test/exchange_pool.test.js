const EnergyToken = artifacts.require("EnergyToken");
const ExchangePool = artifacts.require("ExchangePool");
const { toWei } = require('web3-utils');
const { BN, expectRevert, expectEvent, ether } = require('@openzeppelin/test-helpers');

function toWeiBN(n, unit) {
  return new BN(toWei(n, unit));
}

contract("ExchangePool", function (accounts) {
  it("should assert true", async function () {
    const energyToken = await EnergyToken.deployed();
    const exchangePool = await ExchangePool.deployed();

    const resource = await exchangePool.getResource();
    assert.equal(energyToken.address, resource);

    const tokenOwner = accounts[0];
    const buyer = accounts[1];
    const seller = accounts[2];

    await energyToken.mint(1000, { from: tokenOwner });
    let balance = await energyToken.balanceOf(tokenOwner);
    assert(balance.eq(new BN(1000)));
    balance = await web3.eth.getBalance(tokenOwner);
    assert(new BN(balance).gte(ether("10", "ether")));

    await energyToken.transfer(exchangePool.address, 1000, { from: tokenOwner });
    balance = await energyToken.balanceOf(tokenOwner);
    assert(balance.eq(new BN(0)));
    balance = await energyToken.balanceOf(exchangePool.address);
    assert(balance.eq(new BN(1000)));
    await web3.eth.getBalance(tokenOwner);
    await web3.eth.sendTransaction({ from: tokenOwner, to: exchangePool.address, value: ether("10") });
    balance = await web3.eth.getBalance(exchangePool.address);
    assert(new BN(balance).eq(ether("10")));
    balance = await energyToken.balanceOf(exchangePool.address);
    assert(balance.eq(new BN(1000)));

    await energyToken.mint(1000, { from: tokenOwner });
    await energyToken.transfer(seller, 1000, { from: tokenOwner });
    balance = await energyToken.balanceOf(seller);
    assert(balance.eq(new BN(1000)));

    let pricePerSol = await exchangePool.pricePerSol();
    assert(pricePerSol.eq(new BN(100)));
    await expectRevert.unspecified(exchangePool.sell(100, { from: seller }));
    await energyToken.approve(exchangePool.address, 1000, { from: seller });
    expectEvent(await exchangePool.sell(100, { from: seller }), "Trade", { "sender": seller, "resource": energyToken.address, "sale": true, "amountSol": ether("1").sub(toWeiBN("1", "gwei")), "amountResource": new BN(100) });
    balance = await energyToken.balanceOf(seller);
    assert(balance.eq(new BN(900)));
    balance = await energyToken.balanceOf(exchangePool.address);
    assert(balance.eq(new BN(1100)));
    pricePerSol = await exchangePool.pricePerSol();
    assert(pricePerSol.eq(new BN(190)));
    let collectableFees = await exchangePool.collectableFees();
    assert(collectableFees.eq(toWeiBN("1", "gwei")));
    balance = await web3.eth.getBalance(exchangePool.address);
    assert(new BN(balance).eq(ether("9").add(toWeiBN("1", "gwei"))));

    try {
      await web3.eth.sendTransaction({ from: buyer, to: exchangePool.address, value: new BN(1) });
      assert(false);
    } catch (error) {}

    await web3.eth.sendTransaction({ from: buyer, to: exchangePool.address, value: ether("1").add(toWeiBN("1", "gwei")) });

    balance = await energyToken.balanceOf(buyer);
    assert(balance.eq(new BN(190)));
    balance = await energyToken.balanceOf(exchangePool.address);
    assert(balance.eq(new BN(910)));
    pricePerSol = await exchangePool.pricePerSol();
    assert(pricePerSol.eq(new BN(10)));
    collectableFees = await exchangePool.collectableFees();
    assert(collectableFees.eq(toWeiBN("2", "gwei")));

    balance = await web3.eth.getBalance(exchangePool.address);
    assert(new BN(balance).eq(ether("10").add(toWeiBN("2", "gwei"))));

    balance = await exchangePool.collectableFees();
    assert(new BN(balance).eq(toWeiBN("2", "gwei")));
    await exchangePool.withdraw({ from: tokenOwner });
    balance = await exchangePool.collectableFees();
    assert(new BN(balance).eq(new BN(0)));
    balance = await web3.eth.getBalance(exchangePool.address);
    assert(new BN(balance).eq(ether("10")));

    balance = await energyToken.totalSupply();
    assert(balance.eq(new BN(2000)));
  });
});
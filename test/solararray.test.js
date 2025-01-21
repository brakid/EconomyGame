const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');

contract("Solararray", function (accounts) {
  it("should assert true", async function () {
    const energyToken = await EnergyToken.deployed();
    const solarcell = await Solarcell.deployed();
    const solararray = await Solararray.deployed();

    const resource = await solarcell.getResource();
    assert.equal(energyToken.address, resource);

    const tokenOwner = accounts[0];
    const solarOwner = accounts[1];

    expectEvent(await solarcell.mint({ from: tokenOwner}), "Transfer", { "tokenId": new BN(0) });
    expectEvent(await solarcell.safeTransferFrom(tokenOwner, solarOwner, 0), "Transfer", { "tokenId": new BN(0) });
    let instanceOwner = await solarcell.ownerOf(0);
    assert.equal(instanceOwner, solarOwner);

    expectEvent(await solararray.mint({ from: tokenOwner}), "Transfer", { "tokenId": new BN(0) });
    await solararray.safeTransferFrom(tokenOwner, solarOwner, 0);
    instanceOwner = await solararray.ownerOf(0);
    assert.equal(instanceOwner, solarOwner);

    await expectRevert(solararray.addHarvester(0, 0), "Only owner");
    await expectRevert.unspecified(solararray.addHarvester(0, 0, { from: solarOwner }));
    await expectRevert.unspecified(solararray.addHarvester(0, 1, { from: solarOwner }));

    await solarcell.setApprovalForAll(solararray.address, true, { from: solarOwner });
    await expectRevert.unspecified(solararray.addHarvester(1, 0, { from: solarOwner }));
    expectEvent(await solararray.addHarvester(0, 0, { from: solarOwner }), "Transfer", { "tokenId": new BN(0) });
    instanceOwner = await solarcell.ownerOf(0);
    assert.equal(instanceOwner, solararray.address);

    let availableResources = await solararray.getAvailableResources(0);
    assert(availableResources.eq(new BN(0)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    assert(availableResources.eq(new BN(50)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    assert(availableResources.eq(new BN(100)));

    await expectRevert.unspecified(solararray.withdraw(1, { from: solarOwner}));
    await expectRevert(solararray.withdraw(0, { from: tokenOwner}), "Only owner");
    let supply = await energyToken.totalSupply();
    assert(supply.eq(new BN(0)));
    let balance = await energyToken.balanceOf(solarOwner);
    assert(balance.eq(new BN(0)));
    await solararray.withdraw(0, { from: solarOwner});
    supply = await energyToken.totalSupply();
    assert(supply.eq(new BN(100)));
    balance = await energyToken.balanceOf(solarOwner);
    assert(balance.eq(new BN(100)));

    expectEvent(await solarcell.mint({ from: tokenOwner}), "Transfer", { "tokenId": new BN(1) });
    expectEvent(await solarcell.safeTransferFrom(tokenOwner, solarOwner, 1), "Transfer", { "tokenId": new BN(1) });
    instanceOwner = await solarcell.ownerOf(1);
    assert.equal(instanceOwner, solarOwner);

    expectEvent(await solararray.addHarvester(0, 1, { from: solarOwner }), "Transfer", { "tokenId": new BN(1) });
    instanceOwner = await solarcell.ownerOf(1);
    assert.equal(instanceOwner, solararray.address);

    availableResources = await solararray.getAvailableResources(0);
    assert(availableResources.eq(new BN(0)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    assert(availableResources.eq(new BN(100)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    assert(availableResources.eq(new BN(200)));

    await solararray.withdraw(0, { from: solarOwner});
    supply = await energyToken.totalSupply();
    assert(supply.eq(new BN(300)));
    balance = await energyToken.balanceOf(solarOwner);
    assert(balance.eq(new BN(300)));
  });
});
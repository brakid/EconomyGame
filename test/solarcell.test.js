const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');

contract("Solarcell", function (accounts) {
  it("should assert true", async function () {
    const energyToken = await EnergyToken.deployed();
    const solarcell = await Solarcell.deployed();

    await energyToken.addMinter(solarcell.address);

    const resource = await solarcell.getResource();
    assert.equal(energyToken.address, resource);

    const tokenOwner = accounts[0];
    const solarcellOwner = accounts[1];

    await expectRevert.unspecified(solarcell.mint({ from: solarcellOwner}));
    expectEvent(await solarcell.mint({ from: tokenOwner}), "Transfer", { "tokenId": new BN(0) });
    await solarcell.safeTransferFrom(tokenOwner, solarcellOwner, 0);
    const instanceOwner = await solarcell.ownerOf(0);
    assert.equal(instanceOwner, solarcellOwner);
    let availableResources = await solarcell.getAvailableResources(0);
    assert(availableResources.eq(new BN(0)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solarcell.getAvailableResources(0);
    assert(availableResources.eq(new BN(50)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solarcell.getAvailableResources(0);
    assert(availableResources.eq(new BN(100)));
    await expectRevert.unspecified(solarcell.withdraw(1, { from: solarcellOwner}));
    await expectRevert(solarcell.withdraw(0, { from: tokenOwner}), "Token owner only");
    let supply = await energyToken.totalSupply();
    assert(supply.eq(new BN(0)));
    let balance = await energyToken.balanceOf(solarcellOwner);
    assert(balance.eq(new BN(0)));
    await solarcell.withdraw(0, { from: solarcellOwner});
    supply = await energyToken.totalSupply();
    assert(supply.eq(new BN(100)));
    balance = await energyToken.balanceOf(solarcellOwner);
    assert(balance.eq(new BN(100)));
    await expectRevert.unspecified(solarcell.burn(1, { from: solarcellOwner}));
    await expectRevert(solarcell.burn(0, { from: tokenOwner}), "Token owner only");
    await solarcell.burn(0, { from: solarcellOwner});
    await expectRevert.unspecified(solarcell.ownerOf(0));
  });
});
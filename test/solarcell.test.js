const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("Solarcell", function (accounts) {
  it("should assert true", async function () {
    const token = await EnergyToken.deployed();
    const solarcell = await Solarcell.deployed();

    const resource = await solarcell.getResource();
    assert.equal(token.address, resource);

    const tokenOwner = accounts[0];
    const solarcellOwner = accounts[1];

    await expectRevert.unspecified(solarcell.mint(solarcellOwner, { from: solarcellOwner}));
    await expectRevert(solarcell.mint(ZERO_ADDRESS, { from: tokenOwner}), "Zero address not allowed as receiver");
    expectEvent(await solarcell.mint(solarcellOwner, { from: tokenOwner}), "Transfer", { "tokenId": new BN(1) });
    const instanceOwner = await solarcell.ownerOf(1);
    assert.equal(instanceOwner, solarcellOwner);
    const tier = await solarcell.getTier(1);
    assert(tier.eq(new BN(1)));
    let availableResources = await solarcell.getAvailableResources(1);
    assert(availableResources.eq(new BN(0)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solarcell.getAvailableResources(1);
    assert(availableResources.eq(new BN(0)));
    await time.increase(1800); // by 30 minutes
    availableResources = await solarcell.getAvailableResources(1);
    assert(availableResources.eq(new BN(1)));
    await expectRevert.unspecified(solarcell.retrieve(0, { from: solarcellOwner}));
    await expectRevert(solarcell.retrieve(1, { from: tokenOwner}), "Only the instance holder can retrieve resources");
    let supply = await token.totalSupply();
    assert(supply.eq(new BN(0)));
    let balance = await token.balanceOf(solarcellOwner);
    assert(balance.eq(new BN(0)));
    await solarcell.retrieve(1, { from: solarcellOwner});
    supply = await token.totalSupply();
    assert(supply.eq(new BN(1)));
    balance = await token.balanceOf(solarcellOwner);
    assert(balance.eq(new BN(1)));
    await expectRevert.unspecified(solarcell.burn(0, { from: solarcellOwner}));
    await expectRevert(solarcell.burn(1, { from: tokenOwner}), "Only the instance holder can burn the instance");
    await solarcell.burn(1, { from: solarcellOwner});
    await expectRevert.unspecified(solarcell.ownerOf(1));
  });
});
const Energy = artifacts.require("Energy");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');

contract("Solararray", function (accounts) {
  it("should assert true", async function () {
    const energy = await Energy.new();
    const solarcell = await Solarcell.new(energy.address);
    const solararray = await Solararray.new(solarcell.address);

    await energy.addMinter(solarcell.address);

    const resource = await solarcell.getResource();
    assert.equal(energy.address, resource);

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

    await expectRevert(solararray.addHarvester(0, 0), "Token owner only");
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
    await expectRevert(solararray.withdraw(0, { from: tokenOwner}), "Token owner only");
    let supply = await energy.totalSupply();
    assert(supply.eq(new BN(0)));
    let balance = await energy.balanceOf(solarOwner);
    assert(balance.eq(new BN(0)));
    await solararray.withdraw(0, { from: solarOwner});
    supply = await energy.totalSupply();
    assert(supply.eq(new BN(100)));
    balance = await energy.balanceOf(solarOwner);
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
    supply = await energy.totalSupply();
    assert(supply.eq(new BN(300)));
    balance = await energy.balanceOf(solarOwner);
    assert(balance.eq(new BN(300)));
  });
});
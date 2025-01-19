const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("EnergyToken", function (accounts) {
  it("should assert true", async function () {
    const token = await EnergyToken.deployed();
    assert.equal(await token.name(), "EnergyToken");
    assert.equal(await token.symbol(), "ET");
    assert.equal(await token.decimals(), 18);
    assert.equal(await token.totalSupply(), 0);

    const tokenOwner = accounts[0];
    const tokenMinter = accounts[1];

    await expectRevert(token.mint(1, { from: tokenMinter }), "Sender not allowed to mint");
    await expectRevert.unspecified(token.addMinter(tokenMinter, { from: tokenMinter }));
    await expectRevert(token.addMinter(ZERO_ADDRESS, { from: tokenOwner }), "Zero address not allowed as minter");
    await token.addMinter(tokenMinter, { from: tokenOwner });
    await expectRevert(token.addMinter(tokenMinter, { from: tokenOwner }), "Already added");
    expectEvent(await token.mint(1, { from: tokenMinter }), "Minted", { "sender": tokenMinter, "amount": new BN(1)});
    let balance = await token.balanceOf(tokenMinter);
    assert(balance.eq(new BN(1)));
    expectEvent(await token.burn(1, { from: tokenMinter }), "Burnt", { "sender": tokenMinter, "amount": new BN(1)});
    balance = await token.balanceOf(tokenMinter);
    assert(balance.eq(new BN(0)));
    await expectRevert.unspecified(token.burn(1, { from: tokenMinter }));
  });
});

const EnergyToken = artifacts.require("EnergyToken");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("EnergyToken", function (accounts) {
  it("should assert true", async function () {
    const token = await EnergyToken.deployed();

    const tokenOwner = accounts[0];
    const tokenMinter = accounts[1];

    await expectRevert(token.mint(1, { from: tokenMinter }), "Minters only");
    await expectRevert.unspecified(token.addMinter(tokenMinter, { from: tokenMinter }));
    await expectRevert(token.addMinter(ZERO_ADDRESS, { from: tokenOwner }), "Zero address not allowed as minter");
    await token.addMinter(tokenMinter, { from: tokenOwner });
    await token.mint(1, { from: tokenMinter });
    let balance = await token.balanceOf(tokenMinter);
    assert(balance.eq(new BN(1)));
    await token.burn(1, { from: tokenMinter });
    balance = await token.balanceOf(tokenMinter);
    assert(balance.eq(new BN(0)));
    await expectRevert.unspecified(token.burn(1, { from: tokenMinter }));
  });
});

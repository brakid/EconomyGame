const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const Crafter = artifacts.require("Crafter");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { toWei: web3ToWei } = require('web3-utils');

function toWei(n, unit) {
    return new BN(web3ToWei(n, unit));
}

contract("Crafter", function (accounts) {
  it("should assert true", async function () {
    const energyToken = await EnergyToken.deployed();
    const solarcell = await Solarcell.deployed();
    const solararray = await Solararray.deployed();
    const crafter = await Crafter.deployed();

    const tokenOwner = accounts[0];
    const customer = accounts[1];

    await energyToken.addMinter(accounts[0]);
    await energyToken.addMinter(crafter.address);

    await solarcell.addMinter(crafter.address);

    await energyToken.approve(crafter.address, 1000, { from: customer });
    await energyToken.mint(1000);
    await energyToken.transfer(customer, 1000);
    let balance = await energyToken.balanceOf(customer);
    assert(balance.eq(new BN(1000)));

    expectEvent(await crafter.addRecipe(solarcell.address, [{ ingredient: energyToken.address, amount: 1000 }]), "Recipe");
    expectEvent(await crafter.addRecipe(solararray.address, [{ ingredient: energyToken.address, amount: 10000 }]), "Recipe");

    await expectRevert(crafter.craft(solarcell.address, { from: customer }), "Transaction has a fee of 1 gwei");
    await crafter.craft(solarcell.address, { from: customer, value: toWei("1", "gwei") });
    balance = await energyToken.balanceOf(customer);
    assert(balance.eq(new BN(0)));

    const owner = await solarcell.ownerOf(0);
    assert(owner == customer);

    await energyToken.approve(crafter.address, 10000, { from: customer });
    await energyToken.mint(10000);
    await energyToken.transfer(customer, 10000);
    await expectRevert.unspecified(crafter.craft(solararray.address, { from: customer, value: toWei("1", "gwei")}));
    
  });
});

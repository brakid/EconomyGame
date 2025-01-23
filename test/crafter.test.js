const Energy = artifacts.require("Energy");
const Sand = artifacts.require("Sand");
const Silicium = artifacts.require("Silicium");
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
    const energy = await Energy.new();
    const sand = await Sand.new();
    const silicium = await Silicium.new();
    const solarcell = await Solarcell.new(energy.address);
    const solararray = await Solararray.new(solarcell.address);
    const crafter = await Crafter.new();

    const tokenOwner = accounts[0];
    const customer = accounts[1];

    await energy.addMinter(tokenOwner);
    await energy.addMinter(crafter.address);
    await silicium.addMinter(tokenOwner);
    await silicium.addMinter(crafter.address);
    await sand.addMinter(tokenOwner);
    await sand.addMinter(crafter.address);

    await solarcell.addMinter(crafter.address);

    await energy.approve(crafter.address, 1000, { from: customer });
    await energy.mint(1000);
    await energy.transfer(customer, 1000);
    let balance = await energy.balanceOf(customer);
    assert(balance.eq(new BN(1000)));

    await silicium.approve(crafter.address, 10, { from: customer });
    await silicium.mint(10);
    await silicium.transfer(customer, 10);
    balance = await silicium.balanceOf(customer);
    assert(balance.eq(new BN(10)));

    expectEvent(await crafter.addCraftingRecipe(solarcell.address, [{ ingredient: silicium.address, amount: 10 }, { ingredient: energy.address, amount: 1000 }]), "Recipe");
    expectEvent(await crafter.addCraftingRecipe(solararray.address, [{ ingredient: energy.address, amount: 10000 }]), "Recipe");
    expectEvent(await crafter.addRefinementRecipe(silicium.address, [{ ingredient: sand.address, amount: 10 }, { ingredient: energy.address, amount: 1000 }]), "Recipe");

    await expectRevert(crafter.craft(solarcell.address, { from: customer }), "Transaction has a fee of 1 gwei");
    await crafter.craft(solarcell.address, { from: customer, value: toWei("1", "gwei") });
    balance = await energy.balanceOf(customer);
    assert(balance.eq(new BN(0)));
    balance = await silicium.balanceOf(customer);
    assert(balance.eq(new BN(0)));

    await energy.approve(crafter.address, 1000, { from: customer });
    await energy.mint(1000);
    await energy.transfer(customer, 1000);
    balance = await energy.balanceOf(customer);
    assert(balance.eq(new BN(1000)));

    await sand.approve(crafter.address, 1000, { from: customer });
    await sand.mint(10);
    await sand.transfer(customer, 10);
    balance = await sand.balanceOf(customer);
    assert(balance.eq(new BN(10)));

    await expectRevert(crafter.refine(silicium.address, { from: customer }), "Transaction has a fee of 1 gwei");
    await crafter.refine(silicium.address, { from: customer, value: toWei("1", "gwei") });
    balance = await energy.balanceOf(customer);
    assert(balance.eq(new BN(0)));
    balance = await sand.balanceOf(customer);
    assert(balance.eq(new BN(0)));
    balance = await silicium.balanceOf(customer);
    assert(balance.eq(new BN(1)));

    await energy.approve(crafter.address, 10000, { from: customer });
    await energy.mint(10000);
    await energy.transfer(customer, 10000);
    await expectRevert.unspecified(crafter.craft(solararray.address, { from: customer, value: toWei("1", "gwei")}));
  });
});

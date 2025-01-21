const EnergyToken = artifacts.require("EnergyToken");
const ProofOfExercise = artifacts.require("ProofOfExercise");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract("ProofOfExercise", function (accounts) {
  it("should assert true", async function () {
    const token = await EnergyToken.deployed();
    const proofOfExercise = await ProofOfExercise.deployed();

    const resource = await proofOfExercise.getResource();
    assert.equal(token.address, resource);

    const tokenOwner = accounts[0];
    const user1 = accounts[2];
    const user2 = accounts[3];
    const user3 = accounts[4];
    const user4 = accounts[5];

    await expectRevert.unspecified(proofOfExercise.grantEnergy(user1, 1, { from: user1}));
    await expectRevert(proofOfExercise.grantEnergy(ZERO_ADDRESS, 1, { from: tokenOwner}), "Zero address not allowed");
    await expectRevert(proofOfExercise.grantEnergy(user1, 0, { from: tokenOwner}), "Not enough calories");
    expectEvent(await proofOfExercise.grantEnergy(user1, 15, { from: tokenOwner}), "Proof", { "user": user1, "caloriesBurnt": new BN(15), "energyGranted": new BN(150) });
    expectEvent(await proofOfExercise.grantEnergy(user2, 200, { from: tokenOwner}), "Proof", { "user": user2, "caloriesBurnt": new BN(200), "energyGranted": new BN(2000) });
    expectEvent(await proofOfExercise.grantEnergy(user3, 2000, { from: tokenOwner}), "Proof", { "user": user3, "caloriesBurnt": new BN(2000), "energyGranted": new BN(11000) });
    expectEvent(await proofOfExercise.grantEnergy(user4, 4000, { from: tokenOwner}), "Proof", { "user": user4, "caloriesBurnt": new BN(4000), "energyGranted": new BN(11000) });
    let balance = await token.balanceOf(user1);
    assert(balance.eq(new BN(150)));
    balance = await token.balanceOf(user2);
    assert(balance.eq(new BN(2000)));
    balance = await token.balanceOf(user3);
    assert(balance.eq(new BN(11000)));
    balance = await token.balanceOf(user4);
    assert(balance.eq(new BN(11000)));
  });
});

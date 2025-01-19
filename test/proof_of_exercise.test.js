const EnergyToken = artifacts.require("EnergyToken");
const ProofOfExercise = artifacts.require("ProofOfExercise");
const { BN, expectRevert, expectEvent, ether } = require('@openzeppelin/test-helpers');
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
    await expectRevert(proofOfExercise.grantEnergy(ZERO_ADDRESS, 1, { from: tokenOwner}), "Zero address not allowed as receiver");
    expectEvent(await proofOfExercise.grantEnergy(user1, 0, { from: tokenOwner}), "Proof", { "user": user1, "caloriesBurnt": new BN(0), "energyGranted": ether('0') });
    expectEvent(await proofOfExercise.grantEnergy(user2, 200, { from: tokenOwner}), "Proof", { "user": user2, "caloriesBurnt": new BN(200), "energyGranted": ether('2') });
    expectEvent(await proofOfExercise.grantEnergy(user3, 2000, { from: tokenOwner}), "Proof", { "user": user3, "caloriesBurnt": new BN(2000), "energyGranted": ether('11') });
    expectEvent(await proofOfExercise.grantEnergy(user4, 4000, { from: tokenOwner}), "Proof", { "user": user4, "caloriesBurnt": new BN(4000), "energyGranted": ether('11') });
    let balance = await token.balanceOf(user1);
    assert(balance.eq(ether('0')));
    balance = await token.balanceOf(user2);
    assert(balance.eq(ether('2')));
    balance = await token.balanceOf(user3);
    assert(balance.eq(ether('11')));
    balance = await token.balanceOf(user4);
    assert(balance.eq(ether('11')));
  });
});

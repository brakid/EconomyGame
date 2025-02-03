import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("ProofOfExercise", function () {
  it("should assert true", async function () {
    const [tokenOwner, user1, user2, user3, user4] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const token = await Energy.connect(tokenOwner).deploy();
    await token.waitForDeployment();

    const ProofOfExercise = await hre.ethers.getContractFactory("ProofOfExercise");
    const proofOfExercise = await ProofOfExercise.connect(tokenOwner).deploy(token);
    await proofOfExercise.waitForDeployment();

    await token.connect(tokenOwner).addMinter(proofOfExercise);

    const resource = await proofOfExercise.getResource();
    expect(resource).to.be.equal(token);

    await expect(proofOfExercise.connect(user1).grantEnergy(user1, 1)).to.be.reverted;
    await expect(proofOfExercise.connect(tokenOwner).grantEnergy(ZERO_ADDRESS, 1)).to.be.revertedWith("Zero address not allowed");
    await expect(proofOfExercise.connect(tokenOwner).grantEnergy(user1, 0)).to.be.revertedWith("Not enough calories");
    await expect(proofOfExercise.connect(tokenOwner).grantEnergy(user1, 15)).to.emit(proofOfExercise, "Proof").withArgs(user1, 15, 150);
    await expect(proofOfExercise.connect(tokenOwner).grantEnergy(user2, 200)).to.emit(proofOfExercise, "Proof").withArgs(user2, 200, 2000);
    await expect(proofOfExercise.connect(tokenOwner).grantEnergy(user3, 2000)).to.emit(proofOfExercise, "Proof").withArgs(user3, 2000, 11000);
    await expect(proofOfExercise.connect(tokenOwner).grantEnergy(user4, 4000)).to.emit(proofOfExercise, "Proof").withArgs(user4, 4000, 11000);
    let balance = await token.balanceOf(user1);
    expect(balance).to.be.equal(150);
    balance = await token.balanceOf(user2);
    expect(balance).to.be.equal(2000);
    balance = await token.balanceOf(user3);
    expect(balance).to.be.equal(11000);
    balance = await token.balanceOf(user4);
    expect(balance).to.be.equal(11000);
  });
});

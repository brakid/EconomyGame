import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Mine", function () {
  it("should assert true", async function () {
    const [tokenOwner, miner] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();

    const Sand = await hre.ethers.getContractFactory("Sand");
    const sand = await Sand.connect(tokenOwner).deploy();
    await sand.waitForDeployment();

    const Mine = await hre.ethers.getContractFactory("Mine");
    const mine = await Mine.connect(tokenOwner).deploy(energy, sand);
    await mine.waitForDeployment();

    await energy.connect(tokenOwner).addMinter(mine);
    await sand.connect(tokenOwner).addMinter(mine);

    const resource = await mine.getResource();
    expect(resource).to.be.equal(sand);

    await energy.connect(tokenOwner).addMinter(tokenOwner);
    await energy.connect(miner).approve(mine, 1000);
    await energy.connect(tokenOwner).mint(1000);
    await energy.connect(tokenOwner).transfer(miner, 1000);
    let balance = await energy.balanceOf(miner);
    expect(balance).to.be.equal(1000);
    balance = await energy.totalSupply();
    expect(balance).to.be.equal(1000);
    balance = await sand.balanceOf(miner);
    expect(balance).to.be.equal(0);
    await expect(mine.connect(miner).retrieve()).to.be.revertedWith("No mining started");
    const lockTime = (await time.latest()) + 3600 + 1;
    await expect(mine.connect(miner).mine()).to.emit(mine, "MiningLock").withArgs(miner, lockTime);
    balance = await energy.balanceOf(miner);
    expect(balance).to.be.equal(0);
    balance = await energy.balanceOf(mine);
    expect(balance).to.be.equal(0);
    balance = await energy.totalSupply();
    expect(balance).to.be.equal(0);
    balance = await sand.balanceOf(miner);
    expect(balance).to.be.equal(0);
    balance = await sand.balanceOf(mine);
    expect(balance).to.be.equal(0);
    balance = await sand.totalSupply();
    expect(balance).to.be.equal(0);
    await expect(mine.connect(miner).mine()).to.be.revertedWith("Mining already started");
    await expect(mine.connect(miner).retrieve()).to.be.revertedWith("Mining not finished");
    await time.increase(1800);
    await expect(mine.connect(miner).retrieve()).to.be.revertedWith("Mining not finished");
    await time.increase(1800);
    await expect(mine.connect(miner).retrieve()).not.to.be.reverted;
    balance = await energy.balanceOf(miner);
    expect(balance).to.be.equal(0);
    balance = await energy.balanceOf(mine);
    expect(balance).to.be.equal(0);
    balance = await energy.totalSupply();
    expect(balance).to.be.equal(0);
    balance = await sand.balanceOf(miner);
    expect(balance).to.be.equal(1);
    balance = await sand.balanceOf(mine);
    expect(balance).to.be.equal(0);
    balance = await sand.totalSupply();
    expect(balance).to.be.equal(1);
  });
});
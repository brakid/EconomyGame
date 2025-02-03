import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Solarcell", function () {
  it("should assert true", async function () {
    const [tokenOwner, solarcellOwner] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();

    const Solarcell = await hre.ethers.getContractFactory("Solarcell");
    const solarcell = await Solarcell.connect(tokenOwner).deploy(energy);
    await solarcell.waitForDeployment();

    await energy.connect(tokenOwner).addMinter(solarcell);

    const resource = await solarcell.getResource();
    expect(resource).to.be.equal(energy);

    await expect(solarcell.connect(solarcellOwner).mint()).to.be.reverted;
    await expect (solarcell.connect(tokenOwner).mint()).to.emit(solarcell, "Transfer").withArgs(ZERO_ADDRESS, tokenOwner.address, 0);
    await solarcell.safeTransferFrom(tokenOwner, solarcellOwner, 0);
    const instanceOwner = await solarcell.ownerOf(0);
    expect(instanceOwner).to.be.equal(solarcellOwner);
    let availableResources = await solarcell.getAvailableResources(0);
    expect(availableResources).to.be.equal(0);
    await time.increase(1800); // by 30 minutes
    availableResources = await solarcell.getAvailableResources(0);
    expect(availableResources).to.be.equal(50);
    await time.increase(1800); // by 30 minutes
    availableResources = await solarcell.getAvailableResources(0);
    expect(availableResources).to.be.equal(100);
    await expect(solarcell.connect(solarcellOwner).withdraw(1)).to.be.reverted;
    await expect(solarcell.connect(tokenOwner).withdraw(0)).to.be.revertedWith("Token owner only");
    let supply = await energy.totalSupply();
    expect(supply).to.be.equal(0);
    let balance = await energy.balanceOf(solarcellOwner);
    expect(supply).to.be.equal(0);
    await solarcell.connect(solarcellOwner).withdraw(0);
    supply = await energy.totalSupply();
    expect(supply).to.be.equal(100);
    balance = await energy.balanceOf(solarcellOwner);
    expect(supply).to.be.equal(100);
    await expect(solarcell.connect(solarcellOwner).burn(1)).to.be.reverted;
    await expect(solarcell.connect(tokenOwner).burn(0)).to.be.revertedWith("Token owner only");
    await solarcell.connect(solarcellOwner).burn(0);
    await expect(solarcell.ownerOf(0)).to.be.reverted;
  });
});
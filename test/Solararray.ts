import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Solararray", function () {
  it("should assert true", async function () {
    const [tokenOwner, solarOwner] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();

    const Solarcell = await hre.ethers.getContractFactory("Solarcell");
    const solarcell = await Solarcell.connect(tokenOwner).deploy(energy);
    await solarcell.waitForDeployment();

    const Solararray = await hre.ethers.getContractFactory("Solararray");
    const solararray = await Solararray.connect(tokenOwner).deploy(solarcell);
    await solararray.waitForDeployment();

    await energy.connect(tokenOwner).addMinter(solarcell);

    const resource = await solararray.getResource();
    expect(resource).to.be.equal(energy);

    await expect (solarcell.connect(tokenOwner).mint()).to.emit(solarcell, "Transfer").withArgs(ZERO_ADDRESS, tokenOwner.address, 0);
    await expect(solarcell.connect(tokenOwner).safeTransferFrom(tokenOwner, solarOwner, 0)).to.emit(solarcell, "Transfer").withArgs(tokenOwner.address, solarOwner.address, 0);
    let instanceOwner = await solarcell.ownerOf(0);
    expect(instanceOwner).to.be.equal(solarOwner);
    
    await expect (solararray.connect(tokenOwner).mint()).to.emit(solararray, "Transfer").withArgs(ZERO_ADDRESS, tokenOwner.address, 0);
    await expect(solararray.connect(tokenOwner).safeTransferFrom(tokenOwner, solarOwner, 0)).to.emit(solararray, "Transfer").withArgs(tokenOwner.address, solarOwner.address, 0);
    instanceOwner = await solararray.ownerOf(0);
    expect(instanceOwner).to.be.equal(solarOwner);

    await expect(solararray.connect(tokenOwner).addHarvester(0, 0)).to.be.revertedWith("Token owner only");
    await expect(solararray.connect(solarOwner).addHarvester(0, 0)).to.be.reverted;
    await expect(solararray.connect(solarOwner).addHarvester(0, 1)).to.be.reverted;

    await solarcell.connect(solarOwner).setApprovalForAll(solararray, true);
    await expect(solararray.connect(solarOwner).addHarvester(1, 0)).to.be.reverted;
    await expect(await solararray.connect(solarOwner).addHarvester(0, 0)).to.emit(solarcell, "Transfer").withArgs(solarOwner.address, solararray, 0);
    instanceOwner = await solarcell.ownerOf(0);
    expect(instanceOwner).to.be.equal(solararray);
    
    let availableResources = await solararray.getAvailableResources(0);
    expect(availableResources).to.be.equal(0);
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    expect(availableResources).to.be.equal(50);
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    expect(availableResources).to.be.equal(100);
    await expect(solararray.connect(solarOwner).withdraw(1)).to.be.reverted;
    await expect(solararray.connect(tokenOwner).withdraw(0)).to.be.revertedWith("Token owner only");
    
    let supply = await energy.totalSupply();
    expect(supply).to.be.equal(0);
    let balance = await energy.balanceOf(solarOwner.address);
    expect(supply).to.be.equal(0);
    await solararray.connect(solarOwner).withdraw(0);
    supply = await energy.totalSupply();
    expect(supply).to.be.equal(100);
    balance = await energy.balanceOf(solarOwner);
    expect(supply).to.be.equal(100);

    await expect (solarcell.connect(tokenOwner).mint()).to.emit(solarcell, "Transfer").withArgs(ZERO_ADDRESS, tokenOwner.address, 1);
    await expect(solarcell.connect(tokenOwner).safeTransferFrom(tokenOwner, solarOwner, 1)).to.emit(solarcell, "Transfer").withArgs(tokenOwner.address, solarOwner.address, 1);
    instanceOwner = await solarcell.ownerOf(1);
    expect(instanceOwner).to.be.equal(solarOwner);

    await expect(await solararray.connect(solarOwner).addHarvester(0, 1)).to.emit(solarcell, "Transfer").withArgs(solarOwner.address, solararray, 1);
    instanceOwner = await solarcell.ownerOf(1);
    expect(instanceOwner).to.be.equal(solararray);

    availableResources = await solararray.getAvailableResources(0);
    expect(availableResources).to.be.equal(0);
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    expect(availableResources).to.be.equal(100);
    await time.increase(1800); // by 30 minutes
    availableResources = await solararray.getAvailableResources(0);
    expect(availableResources).to.be.equal(200);
    
    supply = await energy.totalSupply();
    expect(supply).to.be.equal(100);
    balance = await energy.balanceOf(solarOwner.address);
    expect(supply).to.be.equal(100);
    await solararray.connect(solarOwner).withdraw(0);
    supply = await energy.totalSupply();
    expect(supply).to.be.equal(300);
    balance = await energy.balanceOf(solarOwner);
    expect(supply).to.be.equal(300);
  });
});
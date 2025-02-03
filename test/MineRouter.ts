import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("MineRouter", function () {
  it("should assert true", async function () {
    const [tokenOwner] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();
    const Sand = await hre.ethers.getContractFactory("Sand");
    const sand = await Sand.connect(tokenOwner).deploy();
    await sand.waitForDeployment();
    const Oil = await hre.ethers.getContractFactory("Oil");
    const oil = await Oil.connect(tokenOwner).deploy();
    await oil.waitForDeployment();
    const Mine = await hre.ethers.getContractFactory("Mine");
    const sandMine = await Mine.connect(tokenOwner).deploy(energy, sand);
    await sandMine.waitForDeployment();
    const oilMine = await Mine.connect(tokenOwner).deploy(energy, oil);
    await oilMine.waitForDeployment();

    const MineRouter = await hre.ethers.getContractFactory("MineRouter");
    const mineRouter = await MineRouter.connect(tokenOwner).deploy();
    await mineRouter.waitForDeployment();

    await expect(mineRouter.connect(tokenOwner).addMine(sandMine)).to.emit(mineRouter, "MineRegistered").withArgs(sandMine, sand);
    await expect(mineRouter.connect(tokenOwner).addMine(oilMine)).to.emit(mineRouter, "MineRegistered").withArgs(oilMine, oil);
    await expect(mineRouter.connect(tokenOwner).addMine(ZERO_ADDRESS)).to.be.revertedWith("Invalid mine");
    await expect(mineRouter.connect(tokenOwner).addMine(oilMine)).to.be.revertedWith("Mine for resource already registered");
    
    const sandMi = await mineRouter.getMine(sand);
    expect(sandMi).to.be.equal(sandMine);
    await expect(mineRouter.getMine(ZERO_ADDRESS)).to.be.revertedWith("Invalid resource");
    await expect(mineRouter.getMine(sandMine)).to.be.revertedWith("No mine registered for resource");
  });
});
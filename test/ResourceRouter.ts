import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("ResourceRouter", function () {
  it("should assert true", async function () {
    const [tokenOwner] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();
    const Sand = await hre.ethers.getContractFactory("Sand");
    const sand = await Sand.connect(tokenOwner).deploy();
    await sand.waitForDeployment();
    const ResourceRouter = await hre.ethers.getContractFactory("ResourceRouter");
    const resourceRouter = await ResourceRouter.connect(tokenOwner).deploy();
    await resourceRouter.waitForDeployment();

    await resourceRouter.connect(tokenOwner).addResource("Energy", energy);
    let resources = await resourceRouter.getResources();
    expect(resources).to.have.length(1);
    expect(resources[0]).to.be.equal("Energy");
    await resourceRouter.connect(tokenOwner).addResource("Sand", sand);
    resources = await resourceRouter.getResources();
    expect(resources).to.have.length(2);
    expect(resources[0]).to.be.equal("Energy");
    expect(resources[1]).to.be.equal("Sand");
    await expect(resourceRouter.addResource("Dummy", ZERO_ADDRESS)).to.revertedWith("Invalid resource");
    await expect(resourceRouter.addResource("", sand)).to.revertedWith("Empty resource name");
    await expect(resourceRouter.addResource("Sand", energy)).to.revertedWith("Resource with name already registered");
    const resource = await resourceRouter.getResource("Sand");
    expect(resource).to.be.equal(sand);
  });
});
import { expect } from "chai";
import hre from "hardhat";

describe("Crafter", function () {
  it("should assert true", async function () {
    const [tokenOwner, customer] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();
    const Sand = await hre.ethers.getContractFactory("Sand");
    const sand = await Sand.connect(tokenOwner).deploy();
    await sand.waitForDeployment();
    const Silicium = await hre.ethers.getContractFactory("Silicium");
    const silicium = await Silicium.connect(tokenOwner).deploy();
    await silicium.waitForDeployment();

    const Solarcell = await hre.ethers.getContractFactory("Solarcell");
    const solarcell = await Solarcell.connect(tokenOwner).deploy(energy);
    await solarcell.waitForDeployment();
    const Solararray = await hre.ethers.getContractFactory("Solararray");
    const solararray = await Solararray.connect(tokenOwner).deploy(solarcell);
    await solararray.waitForDeployment();

    const Crafter = await hre.ethers.getContractFactory("Crafter");
    const crafter = await Crafter.connect(tokenOwner).deploy();
    await crafter.waitForDeployment();

    await energy.connect(tokenOwner).addMinter(tokenOwner);
    await energy.connect(tokenOwner).addMinter(crafter);
    await silicium.connect(tokenOwner).addMinter(tokenOwner);
    await silicium.connect(tokenOwner).addMinter(crafter);
    await sand.connect(tokenOwner).addMinter(tokenOwner);
    await sand.connect(tokenOwner).addMinter(crafter);

    await solarcell.connect(tokenOwner).addMinter(crafter);

    await energy.connect(customer).approve(crafter, 1000);
    await energy.connect(tokenOwner).mint(1000);
    await energy.connect(tokenOwner).transfer(customer, 1000);
    let balance = await energy.balanceOf(customer);
    expect(balance).to.be.equal(1000);

    await silicium.connect(customer).approve(crafter, 10);
    await silicium.connect(tokenOwner).mint(10);
    await silicium.connect(tokenOwner).transfer(customer, 10);
    balance = await silicium.balanceOf(customer);
    expect(balance).to.be.equal(10);

    await expect(crafter.connect(tokenOwner).addCraftingRecipe(solarcell, [{ ingredient: silicium, amount: 10 }, { ingredient: energy, amount: 1000 }])).to.emit(crafter, "Recipe");
    await expect(crafter.connect(tokenOwner).addCraftingRecipe(solararray, [{ ingredient: energy, amount: 10000 }])).to.emit(crafter, "Recipe");
    await expect(crafter.connect(tokenOwner).addRefinementRecipe(silicium, [{ ingredient: sand, amount: 10 }, { ingredient: energy, amount: 1000 }])).to.emit(crafter, "Recipe");

    await expect(crafter.connect(customer).craft(solarcell)).to.be.revertedWith("Transaction has a fee of 1 gwei");
    await crafter.connect(customer).craft(solarcell, { value: hre.ethers.parseUnits("1", "gwei") });
    balance = await energy.balanceOf(customer);
    expect(balance).to.be.equal(0);
    balance = await silicium.balanceOf(customer);
    expect(balance).to.be.equal(0);

    await energy.connect(customer).approve(crafter, 1000);
    await energy.connect(tokenOwner).mint(1000);
    await energy.connect(tokenOwner).transfer(customer, 1000);
    balance = await energy.balanceOf(customer);
    expect(balance).to.be.equal(1000);

    await sand.connect(customer).approve(crafter, 1000);
    await sand.connect(tokenOwner).mint(10);
    await sand.connect(tokenOwner).transfer(customer, 10);
    balance = await sand.balanceOf(customer);
    expect(balance).to.be.equal(10);

    await expect(crafter.connect(customer).refine(silicium)).to.be.revertedWith("Transaction has a fee of 1 gwei");
    await crafter.connect(customer).refine(silicium, { value: hre.ethers.parseUnits("1", "gwei") });
    balance = await energy.balanceOf(customer);
    expect(balance).to.be.equal(0);
    balance = await sand.balanceOf(customer);
    expect(balance).to.be.equal(0);
    balance = await silicium.balanceOf(customer);
    expect(balance).to.be.equal(1);

    await energy.connect(customer).approve(crafter, 10000);
    await energy.connect(tokenOwner).mint(10000);
    await energy.connect(tokenOwner).transfer(customer, 10000);
    await expect(crafter.connect(customer).craft(solararray, { value: hre.ethers.parseUnits("1", "gwei") })).to.be.revertedWith("Minters only");
  });
});

import { expect } from "chai";
import hre from "hardhat";

describe("InfiniteExchange", function () {
  it("should expect true", async function () {
    const [tokenOwner, buyer, seller] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();

    const InfiniteExchange = await hre.ethers.getContractFactory("InfiniteExchange");
    const infiniteExchange = await InfiniteExchange.connect(tokenOwner).deploy(energy);
    await infiniteExchange.waitForDeployment();
    
    const resource = await infiniteExchange.getResource();
    expect(energy).to.be.equal(resource);

    await energy.connect(tokenOwner).addMinter(infiniteExchange);
    await energy.connect(tokenOwner).addMinter(tokenOwner);

    let pricePerSol = await infiniteExchange.pricePerSol();
    expect(pricePerSol).to.be.equal(100);
    let balance = await energy.totalSupply();
    expect(balance).to.be.equal(0);
    const preBalance = await hre.ethers.provider.getBalance(buyer);
    await expect(infiniteExchange.connect(buyer).buy({ value: hre.ethers.parseEther("1") })).to.emit(infiniteExchange, "Trade").withArgs(buyer, energy, false, hre.ethers.parseEther("1") - hre.ethers.parseUnits("1", "gwei"), 9900);
    const postBalance = await hre.ethers.provider.getBalance(buyer);
    expect(preBalance - postBalance).to.be.greaterThanOrEqual(hre.ethers.parseEther("1"));
    balance = await hre.ethers.provider.getBalance(infiniteExchange);
    expect(balance).to.be.equal(hre.ethers.parseEther("1"));
    balance = await energy.balanceOf(buyer);
    expect(balance).to.be.equal(9900);
    balance = await energy.totalSupply();
    expect(balance).to.be.equal(9900);
    pricePerSol = await infiniteExchange.pricePerSol();
    expect(pricePerSol).to.be.equal(10);

    await energy.connect(tokenOwner).mint(100);
    await energy.connect(tokenOwner).transfer(seller, 100);
    balance = await energy.balanceOf(seller);
    expect(balance).to.be.equal(100);

    pricePerSol = await infiniteExchange.pricePerSol();
    expect(pricePerSol).to.be.equal(10);
    await expect(infiniteExchange.connect(seller).sell(100)).to.be.reverted;
    await energy.connect(seller).approve(infiniteExchange, 100);
    await expect(infiniteExchange.connect(seller).sell(100)).to.emit(infiniteExchange, "Trade").withArgs(seller, energy, true, hre.ethers.parseEther("0.1") - hre.ethers.parseUnits("1", "gwei"), 100);
    balance = await energy.balanceOf(seller);
    expect(balance).to.be.equal(0);
    balance = await energy.balanceOf(infiniteExchange);
    expect(balance).to.be.equal(0);
    pricePerSol = await infiniteExchange.pricePerSol();
    expect(pricePerSol).to.be.equal(11);

    let accruedFees = await infiniteExchange.accruedFees();
    expect(accruedFees).to.be.equal(hre.ethers.parseUnits("2", "gwei"));
    balance = await hre.ethers.provider.getBalance(infiniteExchange);
    const expectedBalance = hre.ethers.parseUnits("1", "ether") - hre.ethers.parseUnits("0.1", "ether") + hre.ethers.parseUnits("1", "gwei"); // 1 ether paid in (including 1 gwei in fees), 0.1 ether - 1 gwei (fees) paid out 
    expect(balance).to.be.equal(expectedBalance);
    await infiniteExchange.connect(tokenOwner).withdraw();
    balance = await hre.ethers.provider.getBalance(infiniteExchange);
    expect(balance).to.be.equal(expectedBalance - hre.ethers.parseUnits("2", "gwei"));
    accruedFees = await infiniteExchange.accruedFees();
    expect(accruedFees).to.be.equal(0);
  });
});
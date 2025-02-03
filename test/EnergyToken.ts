import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("Energy", function () {
  it("should assert true", async function () {
    const [tokenOwner, tokenMinter] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const token = await Energy.connect(tokenOwner).deploy();
    await token.waitForDeployment();

    await expect(token.connect(tokenMinter).mint(1)).to.be.revertedWith("Minters only");
    await expect(token.connect(tokenMinter).addMinter(tokenMinter)).to.be.reverted;
    await expect(token.connect(tokenOwner).addMinter(ZERO_ADDRESS)).to.be.revertedWith("Zero address not allowed as minter");
    await token.connect(tokenOwner).addMinter(tokenMinter);
    await token.connect(tokenMinter).mint(1);
    let balance = await token.balanceOf(tokenMinter);
    expect(balance).to.be.equal(1);
    await token.connect(tokenMinter).burn(1);
    balance = await token.balanceOf(tokenMinter);
    expect(balance).to.be.equal(0);
    await expect(token.connect(tokenMinter).burn(1)).to.be.reverted;
  });
});
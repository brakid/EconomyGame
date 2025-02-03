import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("ExchangeRouter", function () {
  it("should assert true", async function () {
    const [tokenOwner] = await hre.ethers.getSigners();

    const Energy = await hre.ethers.getContractFactory("Energy");
    const energy = await Energy.connect(tokenOwner).deploy();
    await energy.waitForDeployment();
    const Sand = await hre.ethers.getContractFactory("Sand");
    const sand = await Sand.connect(tokenOwner).deploy();
    await sand.waitForDeployment();
    const InfiniteExchange = await hre.ethers.getContractFactory("InfiniteExchange");
    const energyExchange = await InfiniteExchange.connect(tokenOwner).deploy(energy);
    await energyExchange.waitForDeployment();
    const sandExchange = await InfiniteExchange.connect(tokenOwner).deploy(sand);
    await sandExchange.waitForDeployment();
   
    const ExchangeRouter = await hre.ethers.getContractFactory("ExchangeRouter");
    const exchangeRouter = await ExchangeRouter.connect(tokenOwner).deploy();
    await exchangeRouter.waitForDeployment();

    await expect(exchangeRouter.connect(tokenOwner).addExchange(energyExchange)).to.emit(exchangeRouter, "ExchangeRegistered").withArgs(energyExchange, energy);
    await expect(exchangeRouter.connect(tokenOwner).addExchange(energyExchange)).to.be.revertedWith("Exchange for resource already registered");
    await expect(exchangeRouter.connect(tokenOwner).addExchange(ZERO_ADDRESS)).to.be.revertedWith("Invalid exchange");
    await expect(exchangeRouter.connect(tokenOwner).addExchange(sandExchange)).to.emit(exchangeRouter, "ExchangeRegistered").withArgs(sandExchange, sand);

    const sandEx = await exchangeRouter.getExchange(sand);
    expect(sandEx).to.be.equal(sandExchange);
    await expect(exchangeRouter.getExchange(ZERO_ADDRESS)).to.be.revertedWith("Invalid resource");
    await expect(exchangeRouter.getExchange(sandExchange)).to.be.revertedWith("No exchange registered for resource");
  });
});
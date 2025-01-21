const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const InfiniteExchange = artifacts.require("InfiniteExchange");

module.exports = async function(deployer) {
  await deployer.deploy(EnergyToken);
  await deployer.deploy(Solarcell, EnergyToken.address);
  await deployer.deploy(Solararray, Solarcell.address);
  await deployer.deploy(InfiniteExchange, EnergyToken.address);

  const energyToken = await EnergyToken.deployed();
  const solarcell = await Solarcell.deployed();
  const solararray = await Solararray.deployed();
  const infiniteExchange = await InfiniteExchange.deployed();

  energyToken.addMinter(solarcell.address);
  energyToken.addMinter(infiniteExchange.address);
};
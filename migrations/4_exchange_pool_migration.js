const EnergyToken = artifacts.require("EnergyToken");
const ExchangePool = artifacts.require("ExchangePool");
module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(ExchangePool, EnergyToken.address, web3.utils.toWei("1", "gwei"));
};
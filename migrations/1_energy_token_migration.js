const EnergyToken = artifacts.require("EnergyToken");
module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(EnergyToken);
};
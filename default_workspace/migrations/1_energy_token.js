const EnergyToken = artifacts.require("EnergyToken");

module.exports = function(deployer) {
  deployer.deploy(EnergyToken);
};
const Exchange = artifacts.require("Exchange");
const EnergyToken = artifacts.require("EnergyToken");

module.exports = function(deployer) {
  deployer.deploy(Exchange, EnergyToken.address);
};
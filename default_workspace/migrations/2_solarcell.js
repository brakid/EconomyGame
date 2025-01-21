const Solarcell = artifacts.require("Solarcell");
const EnergyToken = artifacts.require("EnergyToken");

module.exports = function(deployer) {
  deployer.deploy(Solarcell, EnergyToken.address);
};
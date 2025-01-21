const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");

module.exports = function(deployer) {
  deployer.deploy(Solararray, Solarcell.address);
};
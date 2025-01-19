const EnergyToken = artifacts.require("EnergyToken");
const Solarcell = artifacts.require("Solarcell");
module.exports = async function(deployer, network, accounts) {
  console.log(await deployer.deploy(Solarcell, EnergyToken.address));

  const energyToken = await EnergyToken.deployed();
  const solarcell = await Solarcell.deployed();

  await energyToken.addMinter(solarcell.address);
};
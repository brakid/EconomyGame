const EnergyToken = artifacts.require("EnergyToken");
const ProofOfExercise = artifacts.require("ProofOfExercise");
module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(ProofOfExercise, EnergyToken.address);

  const energyToken = await EnergyToken.deployed();
  const proofOfExercise = await ProofOfExercise.deployed();

  await energyToken.addMinter(proofOfExercise.address);
};
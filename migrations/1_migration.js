const EnergyToken = artifacts.require("EnergyToken");
const InfiniteExchange = artifacts.require("InfiniteExchange");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const ProofOfExercise = artifacts.require("ProofOfExercise");

module.exports = async function(deployer) {
    await deployer.deploy(EnergyToken);
    await deployer.deploy(InfiniteExchange, EnergyToken.address, 1000000000); // 1 gwei
    await deployer.deploy(Solarcell, EnergyToken.address);
    await deployer.deploy(Solararray, Solarcell.address);
    await deployer.deploy(ProofOfExercise, EnergyToken.address);

    const energyToken = await EnergyToken.deployed();
    const solarcell = await Solarcell.deployed();
    const proofOfExercise = await ProofOfExercise.deployed();

    await energyToken.addMinter(solarcell.address);
    await energyToken.addMinter(proofOfExercise.address);  
};
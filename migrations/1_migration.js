const EnergyToken = artifacts.require("EnergyToken");
const InfiniteExchange = artifacts.require("InfiniteExchange");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const ProofOfExercise = artifacts.require("ProofOfExercise");
const Crafter = artifacts.require("Crafter");

module.exports = async function(deployer) {
    await deployer.deploy(EnergyToken);
    await deployer.deploy(InfiniteExchange, EnergyToken.address);
    await deployer.deploy(Solarcell, EnergyToken.address);
    await deployer.deploy(Solararray, Solarcell.address);
    await deployer.deploy(ProofOfExercise, EnergyToken.address);
    await deployer.deploy(Crafter);
};

/*
    const energyToken = await EnergyToken.deployed();
    const solarcell = await Solarcell.deployed();
    const solararray = await Solararray.deployed();
    const proofOfExercise = await ProofOfExercise.deployed();
    const crafter = await Crafter.deployed();

    await energyToken.addMinter(accounts[0]);
    await energyToken.addMinter(solarcell.address);
    await energyToken.addMinter(proofOfExercise.address);
    await energyToken.addMinter(crafter.address);

    await solarcell.addMinter(crafter.address);
    await solararray.addMinter(crafter.address);

    await energyToken.approve(crafter.address, 1000);
    await energyToken.mint(1000);
    await crafter.addRecipe(solarcell.address, [{ ingredient: energyToken.address, amount: 1000 }]);
    await crafter.addRecipe(solararray.address, [{ ingredient: energyToken.address, amount: 10000 }]);
*/
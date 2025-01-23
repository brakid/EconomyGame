const Energy = artifacts.require("Energy");
const Sand = artifacts.require("Sand");
const IronOre = artifacts.require("IronOre");
const Oil = artifacts.require("Oil");
const Silicium = artifacts.require("Silicium");
const Iron = artifacts.require("Iron");
const Carbon = artifacts.require("Carbon");
const InfiniteExchange = artifacts.require("InfiniteExchange");
const ExchangeRouter = artifacts.require("ExchangeRouter");
const Solarcell = artifacts.require("Solarcell");
const Solararray = artifacts.require("Solararray");
const ProofOfExercise = artifacts.require("ProofOfExercise");
const Crafter = artifacts.require("Crafter");
const ResourceRouter = artifacts.require("ResourceRouter");

module.exports = async function(deployer, network) {
    // Resources
    await deployer.deploy(Energy);
    await deployer.deploy(Sand);
    await deployer.deploy(IronOre);
    await deployer.deploy(Oil);
    await deployer.deploy(Silicium);
    await deployer.deploy(Iron);
    await deployer.deploy(Carbon);

    await deployer.deploy(ResourceRouter);

    // Trading
    await deployer.deploy(InfiniteExchange, Energy.address);
    const energyExchange = await InfiniteExchange.deployed();
    await deployer.deploy(ExchangeRouter);

    // Harvesters
    await deployer.deploy(Solarcell, Energy.address);
    await deployer.deploy(Solararray, Solarcell.address);
    
    // Utilities
    await deployer.deploy(ProofOfExercise, Energy.address);
    await deployer.deploy(Crafter);

    if (network === 'brakidchain') {
        await deployer.deploy(InfiniteExchange, Sand.address);
        const sandExchange = await InfiniteExchange.deployed();
        await deployer.deploy(InfiniteExchange, IronOre.address);
        const ironOreExchange = await InfiniteExchange.deployed();
        await deployer.deploy(InfiniteExchange, Oil.address);
        const oilExchange = await InfiniteExchange.deployed();

        const energy = await Energy.deployed();
        const sand = await Sand.deployed();
        const ironOre = await IronOre.deployed();
        const oil = await Oil.deployed();
        const silicium = await Silicium.deployed();
        const iron = await Iron.deployed();
        const carbon = await Carbon.deployed();

        const resourceRouter = await ResourceRouter.deployed();
        await resourceRouter.addResource("Energy", energy.address);
        await resourceRouter.addResource("Sand", sand.address);
        await resourceRouter.addResource("IronOre", ironOre.address);
        await resourceRouter.addResource("Oil", oil.address);
        await resourceRouter.addResource("Silicium", silicium.address);
        await resourceRouter.addResource("Iron", iron.address);
        await resourceRouter.addResource("Carbon", carbon.address);

        const exchangeRouter = await ExchangeRouter.deployed();

        await exchangeRouter.addExchange(energyExchange.address);
        await exchangeRouter.addExchange(sandExchange.address);
        await exchangeRouter.addExchange(ironOreExchange.address);
        await exchangeRouter.addExchange(oilExchange.address);
        
        const solarcell = await Solarcell.deployed();
        const solararray = await Solararray.deployed();
        const proofOfExercise = await ProofOfExercise.deployed();

        const crafter = await Crafter.deployed();
        await crafter.addRecipe(solarcell.address, [{ ingredient: silicium.address, amount: 10 }, { ingredient: energy.address, amount: 1000 }]);
        await crafter.addRecipe(solararray.address, [{ ingredient: iron.address, amount: 20 }, { ingredient: energy.address, amount: 10000 }]);
        await crafter.addRecipe(silicium.address, [{ ingredient: sand.address, amount: 5 }, { ingredient: energy.address, amount: 1000 }]);
        await crafter.addRecipe(iron.address, [{ ingredient: ironOre.address, amount: 10 }, { ingredient: energy.address, amount: 5000 }]);
        await crafter.addRecipe(carbon.address, [{ ingredient: oil.address, amount: 5 }, { ingredient: energy.address, amount: 10000 }]);

        await energy.addMinter(solarcell.address);
        await energy.addMinter(proofOfExercise.address);
        await energy.addMinter(crafter.address);

        await energy.addMinter(solarcell.address);
        await energy.addMinter(proofOfExercise.address);
        await energy.addMinter(crafter.address);

        await solarcell.addMinter(crafter.address);
        await solararray.addMinter(crafter.address);
        await sand.addMinter(crafter.address);
        await silicium.addMinter(crafter.address);
        await ironOre.addMinter(crafter.address);
        await iron.addMinter(crafter.address);
        await oil.addMinter(crafter.address);
        await carbon.addMinter(crafter.address);

        await energy.addMinter(energyExchange.address);
        await sand.addMinter(sandExchange.address);
        await ironOre.addMinter(ironOreExchange.address);
        await oil.addMinter(oilExchange.address);
    }
}
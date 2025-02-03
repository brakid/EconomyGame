import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EconomyGameModule = buildModule("EconomyGameModule", (module) => {
  // Resources
  const energy = module.contract("Energy");
  const sand = module.contract("Sand");
  const ironOre = module.contract("IronOre");
  const oil = module.contract("Oil");
  const silicium = module.contract("Silicium");
  const iron = module.contract("Iron");
  const carbon = module.contract("Carbon");

  const resourceRouter = module.contract("ResourceRouter");
  module.call(resourceRouter, "addResource", ["Energy", energy], { id: "addEnergy" });
  module.call(resourceRouter, "addResource", ["Sand", sand], { id: "addSand" });
  module.call(resourceRouter, "addResource", ["IronOre", ironOre], { id: "addIronIro" });
  module.call(resourceRouter, "addResource", ["Oil", oil], { id: "addOil" });
  module.call(resourceRouter, "addResource", ["Silicium", silicium], { id: "addSIlicium" });
  module.call(resourceRouter, "addResource", ["Iron", iron], { id: "addIron" });
  module.call(resourceRouter, "addResource", ["Carbon", carbon], { id: "addCarbon" });

  // Trading
  const energyExchange = module.contract("InfiniteExchange", [energy], { id: "EnergyExchange" });
  const sandExchange = module.contract("InfiniteExchange", [sand], { id: "SandExchange" });
  const ironOreExchange = module.contract("InfiniteExchange", [ironOre], { id: "IronOreExchange" });
  const oilExchange = module.contract("InfiniteExchange", [oil], { id: "OilExchange" });
  
  const exchangeRouter = module.contract("ExchangeRouter");

  module.call(exchangeRouter, "addExchange", [energyExchange], { id: "addEnergyExchange" });
  module.call(exchangeRouter, "addExchange", [sandExchange], { id: "addSandExchange" });
  module.call(exchangeRouter, "addExchange", [ironOreExchange], { id: "addIronOreExchange" });
  module.call(exchangeRouter, "addExchange", [oilExchange], { id: "addOilExchange" });

  module.call(energy, "addMinter", [energyExchange], { id: "energyMinterAddEnergyExchange" });
  module.call(sand, "addMinter", [sandExchange], { id: "sandMinterAddSandExchange" });
  module.call(ironOre, "addMinter", [ironOreExchange], { id: "ironOreMinterAddIronOreExchange" });
  module.call(oil, "addMinter", [oilExchange], { id: "oilMinterAddOilExchange" });

  // Harvesters
  const solarcell = module.contract("Solarcell", [energy]);
  const solararray = module.contract("Solararray", [solarcell]);
  
  module.call(energy, "addMinter", [solarcell]);

  // Crafting
  const crafter = module.contract("Crafter");

  module.call(crafter, "addCraftingRecipe", [solarcell, [{ ingredient: silicium, amount: 10 }, { ingredient: energy, amount: 1000 }]], { id: "craftSolarcell" });
  module.call(crafter, "addCraftingRecipe", [solararray, [{ ingredient: iron, amount: 20 }, { ingredient: energy, amount: 10000 }]], { id: "craftSolararray" });
  module.call(crafter, "addRefinementRecipe", [silicium, [{ ingredient: sand, amount: 5 }, { ingredient: energy, amount: 1000 }]], { id: "refineSand" });
  module.call(crafter, "addRefinementRecipe", [iron, [{ ingredient: ironOre, amount: 10 }, { ingredient: energy, amount: 5000 }]], { id: "refineIronOre" });
  module.call(crafter, "addRefinementRecipe", [carbon, [{ ingredient: oil, amount: 5 }, { ingredient: energy, amount: 10000 }]], { id: "refineOil" });

  module.call(solarcell, "addMinter", [crafter], { id: "solarcellMinterAddCrafter" });
  module.call(solararray, "addMinter", [crafter], { id: "solararrayMinterAddCrafter" });
  module.call(energy, "addMinter", [crafter], { id: "energyMinterAddCrafter" });
  module.call(sand, "addMinter", [crafter], { id: "sandMinterAddCrafter" });
  module.call(ironOre, "addMinter", [crafter], { id: "ironOreMinterAddCrafter" });
  module.call(oil, "addMinter", [crafter], { id: "oilMinterAddCrafter" });
  module.call(silicium, "addMinter", [crafter], { id: "siliciumMinterAddCrafter" });
  module.call(iron, "addMinter", [crafter], { id: "ironMinterAddCrafter" });
  module.call(carbon, "addMinter", [crafter], { id: "carbonMinterAddCrafter" });

  // Utilities
  const proofOfExercise = module.contract("ProofOfExercise", [energy]);

  module.call(energy, "addMinter", [proofOfExercise], { id: "energyMinterAddPoE" });

  // Mines
  const sandMine = module.contract("Mine", [energy, sand], { id: "SandMine" });
  const ironOreMine = module.contract("Mine", [energy, ironOre], { id: "IronOreMine" });
  const oilMine = module.contract("Mine", [energy, oil], { id: "OilMine" });

  module.call(energy, "addMinter", [sandMine], { id: "energyMinterAddSandMine" });
  module.call(energy, "addMinter", [ironOreMine], { id: "energyMinterAddIronOreMine" });
  module.call(energy, "addMinter", [oilMine], { id: "energyMinterAddOilMine" });
  module.call(sand, "addMinter", [sandMine], { id: "sandMinterAddSandMiner" });
  module.call(ironOre, "addMinter", [ironOreMine], { id: "ironOreMinterAddIronOreMine" });
  module.call(oil, "addMinter", [oilMine], { id: "oilMinterAddOilMine" });

  const mineRouter = module.contract("MineRouter");

  module.call(mineRouter, "addMine", [sandMine], { id: "addSandMine" });
  module.call(mineRouter, "addMine", [ironOreMine], { id: "addIronOreMine" });
  module.call(mineRouter, "addMine", [oilMine], { id: "addOilMine" });

  return { resourceRouter, solarcell, solararray, exchangeRouter, crafter, proofOfExercise, mineRouter };
});

export default EconomyGameModule;

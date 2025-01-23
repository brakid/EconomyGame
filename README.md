# Economy Game
## Resources (as ERC20 token)
* Energy: representing all types of energy: required for processing resources into refined materials, used as fuel
* Iron Ore, Sand, Oil: raw materials that can be refined
## Refined Materials (as ERC20 token)
* Iron Ore -> Iron: construction material
* Oil -> Plastic: construction material
* Silicium -> needed for Solarcells or for computer chips in HarvestingRobots
## Harvesters (as ERC721 token - NFT)
* Solarcell: no fuel needed, produce Energy (1 token per hour)
* HarvestingRobot: requires Energys as fuel (running out of fuel = stops producing raw materials), produces raw materials
### Aggregators
* Solararray: houses several Solarcells
* HarvestingFleet: aggregated several HarvestingRobots for the same resource type
## Exchanges
Trade the chain native currency against resource materials. The prices will vary based on supply and demand. The exchanges can sell an infinite amount of each raw material (to be discussed whether this should be replaced by limited resource pools to avoid massive resource inflation)
## Refinery
Use energy to refine raw materials
## Crafter
Construct new Harvesters or Aggregators
## Getting Started
Receive Energy for a Proof of Physical Exercise. Caliries burnt -> Energy earned

# Usage via truffle console
```
let solarcell = await Solarcell.at('0x63f3468e34656c9321cb264021fc154f934400c2');
let solararray = await Solararray.at('0x63f3468e34656c9321cb264021fc154f934400c2');
let Energy = await Energy.at('0x0cc664eA36dc5604b45bd8fFC0c2eaded868DEe0');
let proof = await ProofOfExercise.at('0x7068fa718bdfa9bca6732fc2ef610c7178ef3ef6');
let infiniteExchange = await InfiniteExchange.at('0x849b71e19ad5c15af17c63ea19e8059fb7912d92');
```

# Next Steps:
* more raw materials and refined goods
* refinery & workshop implementation
* Webapp as UI
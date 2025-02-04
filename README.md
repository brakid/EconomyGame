# Economy Game
Play-to-earn game where you need to collect resources and sell them. You also can use the resources to automate the gathering of resources such as energy, sand and oil. Resource refining is needed to construct useful machines such as Solarcells or HarvestingRobots that take away the manual collection need to gather resources.

## Resources (as ERC20 token)
* Energy: representing all types of energy: required for processing resources into refined materials, used as fuel
* Iron Ore, Sand, Oil: raw materials that can be refined
## Refined Materials (as ERC20 token)
* Iron Ore -> Iron: construction material
* Oil -> Plastic: construction material
* Silicium -> needed for Solarcells or for computer chips in HarvestingRobots
## Harvesters (as ERC721 token - NFT)
* Solarcell: no fuel needed, produce Energy (1 token per hour)
* (not implemented yet) HarvestingRobot: requires Energys as fuel (running out of fuel = stops producing raw materials), produces raw materials
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
Receive Energy for a Proof of Physical Exercise. Calories burnt -> Energy earned
Mine resources (lock 10 Energy to obtain 1 Resource after 1 hour)

## Contract addresses (local chain deployment):
* Carbon - 0x99F38461293e45F4d46f5F37AC25894254540948
* Energy - 0x260e03F4b53468a81ddB80B9746FD2E199A66e40
* Iron - 0x549C4265791b503587e974e30bE6AEB7BF35FDE9
* IronOre - 0x7F434B99d96bf537DD8ec5E13bC54Dd3A8859C9C
* Oil - 0xF834D5F318f96479C311E482696a1507bbfB708d
* ResourceRouter - 0x16D23d8340582f95D8d51f6Ed84C7aDD4A04aeb7
* Sand - 0x4d07DEEE968Dbd7548C66EDFb73aD3D1661a2eE8
* Silicium - 0x756FEB454f5dFB8BB1cf33C76eCE1E7E4360B448
* Crafter - 0x2c63c3bC265de5e3FB8203a01C0ADcBAc79f3B99
* EnergyExchange - 0x2Fa791e145EEC8B49b54f8D9505ceEeBAAF467D2
* ExchangeRouter - 0x18C059406D7CA958Aa0A215f638e6e07aC707FAb
* IronOreExchange - 0x8404136CF90477D2B5a2b381Ea418693BD511950
* OilExchange - 0xbfFB95b1E189d190a5EC2A941D1431093F24e0dE
* ProofOfExercise - 0xcD6EA99A687e95604aE9E7c6F99618b84649fac3
* SandExchange - 0x7a3752BA5A7D2e97542E37094C0463794373Ec8E
* Solarcell - 0xd65E1F93f03cbd091EB4A4FD0F6107dffb1964Ca
* Solararray - 0x51FAFaBd24861e96b6A8EBe734187a8F18E6700e
* IronOreMine - 0x5adcdfDc48bf515CA6F6409657557BAC9b727528
* MineRouter - 0x600CBF21B42fc68CECBC1bfBb0C62Dce7427F4fa
* OilMine - 0xC34677064fFb446236Bf7357492c6246A82b03Ea
* SandMine - 0xe63147988932774E186cE435906dBdFc23894F3D

# Usage via Hardhat console
```
const proofOfExercise = await ethers.getContractAt('ProofOfExercise', '0xcD6EA99A687e95604aE9E7c6F99618b84649fac3')
await proofOfExercise.grantEnergy('0x257444946AC42279fD92408bb86b031057305481', 500)

const sandExchange = await ethers.getContractAt('InfiniteExchange', '0x7a3752BA5A7D2e97542E37094C0463794373Ec8E')
await sandExchange.buy({ value: ethers.parseEther("1") + ethers.parseUnits("1", "gwei") })

const energy = await ethers.getContractAt('Energy', '0x260e03F4b53468a81ddB80B9746FD2E199A66e40')
const sand = await ethers.getContractAt('Sand', '0x4d07DEEE968Dbd7548C66EDFb73aD3D1661a2eE8')
const silicium = await ethers.getContractAt('Silicium', '0x756FEB454f5dFB8BB1cf33C76eCE1E7E4360B448')
const crafter = await ethers.getContractAt('Crafter', '0x2c63c3bC265de5e3FB8203a01C0ADcBAc79f3B99')

await energy.approve(crafter, ethers.parseEther("1000"))
await sand.approve(crafter, ethers.parseEther("1000"))

await crafter.refine(silicium, { value: ethers.parseUnits("1", "gwei") })
await silicium.approve(crafter, ethers.parseEther("1000"))
const solarcell = await ethers.getContractAt('Solarcell', '0xd65E1F93f03cbd091EB4A4FD0F6107dffb1964Ca')

await crafter.craft(solarcell, { value: ethers.parseUnits("1", "gwei") })
await solarcell.getAvailableResources(0)
await solarcell.withdraw(0)

const sandMine = await ethers.getContractAt('Mine', '0xe63147988932774E186cE435906dBdFc23894F3D')
await sandMine.getResource()

await energy.approve(sandMine, ethers.parseEther("1000"))

await sandMine.mine()
await sandMine.retrieve()

const ironOreMine = await ethers.getContractAt('Mine', '0x5adcdfDc48bf515CA6F6409657557BAC9b727528')
await ironOreMine.getResource()

await energy.approve(ironOreMine, ethers.parseEther("1000"))
await ironOreMine.mine()
await ironOreMine.retrieve()
```

# Next Steps:
* refuelable harvesters for resources other than energy
* Webapp as UI
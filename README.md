# Economy Game
* collect raw materials (Iron Ore, Oil, Sand)
* refine raw materials: Iron Ore -> Iron, Oil -> Plastic, Sand -> Silicium
* construct: Solarcells (to automate energy collection), ResourceCollectors (to automate raw material harvesting)
 * upgrade to increase resource yield
* trade: raw materials & energy (MarketMaker as exchange partner)
* Proof Of Exercise: getting started - physical exercise -> energy tokens

## Usage via truffle console
```
let solarcell = await Solarcell.at('0xd7a68CDe57Da025109ee8a3120F1ec560c7829e4');
let proofOfExercise = await ProofOfExercise.deployed();
```
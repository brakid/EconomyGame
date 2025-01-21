# Economy Game
* collect raw materials (Iron Ore, Oil, Sand)
* refine raw materials: Iron Ore -> Iron, Oil -> Plastic, Sand -> Silicium
* construct: Solarcells (to automate energy collection), ResourceCollectors (to automate raw material harvesting)
 * upgrade to increase resource yield
* trade: raw materials & energy (MarketMaker as exchange partner)
* Proof Of Exercise: getting started - physical exercise -> energy tokens

## Usage via truffle console
```
let solarcell = await Solarcell.at('0x63f3468e34656c9321cb264021fc154f934400c2');
let energyToken = await EnergyToken.at('0x0cc664eA36dc5604b45bd8fFC0c2eaded868DEe0');
let proof = await ProofOfExercise.at('0x7068fa718bdfa9bca6732fc2ef610c7178ef3ef6');
let exchange = await ExchangePool.at('0x849b71e19ad5c15af17c63ea19e8059fb7912d92');
```
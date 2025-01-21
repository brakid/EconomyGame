REMIX DEFAULT WORKSPACE

Remix default workspace is present when:
i. Remix loads for the very first time 
ii. A new workspace is created with 'Default' template
iii. There are no files existing in the File Explorer

This workspace contains 3 directories:

1. 'contracts': Holds three contracts with increasing levels of complexity.
2. 'scripts': Contains four typescript files to deploy a contract. It is explained below.
3. 'tests': Contains one Solidity test file for 'Ballot' contract & one JS test file for 'Storage' contract.

SCRIPTS

The 'scripts' folder has four typescript files which help to deploy the 'Storage' contract using 'web3.js' and 'ethers.js' libraries.

For the deployment of any other contract, just update the contract name from 'Storage' to the desired contract and provide constructor arguments accordingly 
in the file `deploy_with_ethers.ts` or  `deploy_with_web3.ts`

In the 'tests' folder there is a script containing Mocha-Chai unit tests for 'Storage' contract.

To run a script, right click on file name in the file explorer and click 'Run'. Remember, Solidity file must already be compiled.
Output from script will appear in remix terminal.

Please note, require/import is supported in a limited manner for Remix supported modules.
For now, modules supported by Remix are ethers, web3, swarmgw, chai, multihashes, remix and hardhat only for hardhat.ethers object/plugin.
For unsupported modules, an error like this will be thrown: '<module_name> module require is not supported by Remix IDE' will be shown.





Upgrade:
* deposit Ether - by user
* upgrade (check balance is high enough by user, subtract from available balance)
* allow withdrawing - use user balance
 * account to balanceForOwner increases




const energyToken = await EnergyToken.at('0xB7967D9F0a9f7B6A462a2a9837E9A505E610895e');
const solarcell = await Solarcell.at('0x56117Dc123A8888b1171B44Cd7C12513fb566f0f');
const solararray = await Solararray.at('0xC77C517cFF59960255254CedE3217d3A81784E4E');
const infiniteExchange = await InfiniteExchange.at('0x33223FEcf7E44377c08B6289fcbc38370Df8b70C');

solarcell.mint()
solarcell.ownerOf(0) -> should be accounts[0]
solarcell.setApprovalForAll(solararray.address, true)
solararray.mint()
solararray.addHarvester(0, 0)
solarcell.ownerOf(0) -> should be solararray.address
solararray.getAvailableResources(0)
energyToken.totalSupply() -> should be 0
solararray.withdraw(0)
energyToken.totalSupply() -> should be > 0
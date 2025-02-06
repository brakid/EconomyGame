import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import * as IToken from '../../artifacts/contracts/Interfaces.sol/IToken.json';
import * as Solarcell from '../../artifacts/contracts/Solarcell.sol/Solarcell.json';
import * as IMine from '../../artifacts/contracts/Interfaces.sol/IMine.json';
import * as Crafter from '../../artifacts/contracts/Crafter.sol/Crafter.json';

interface Contracts {
  energyContract: ethers.Contract,
  sandContract: ethers.Contract,
  siliciumContract: ethers.Contract,
  solarcellContract: ethers.Contract,
  sandMineContract: ethers.Contract,
  crafterContract: ethers.Contract,
}

const zip = <S, T>(a: S[], b: T[]): [S, T][] => a.map((k, i) => [k, b[i]]);
const range = (n: number | bigint): number[] => {
  let array = [];
  for (let i = 0; i < n; i++) {
    array.push(i);
  }
  return array;
}

const App = () => {
  const [provider] = useState(new ethers.BrowserProvider((window as any).ethereum, 'any'));
  const [contracts, setContracts] = useState<Contracts>();
  const [blockNumber, setBlockNumber] = useState<number>(-1);
  const [signerAddress, setSignerAddress] = useState<string>('');
  const [energyBalance, setEnergyBalance] = useState<number>(0);
  const [sandBalance, setSandBalance] = useState<number>(0);
  const [siliciumBalance, setSiliciumBalance] = useState<number>(0);
  const [solarcells, setSolarcells] = useState<[number, string][]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const init = async () => {
      try {
        const network = await provider.getNetwork();
        if (network.chainId !== 1339n) {
          await provider.send('wallet_switchEthereumChain', [{ chainId: '0x53b' }]);
          window.location.reload();
        }
        const signerProvider = await provider.getSigner();
        setSignerAddress(await signerProvider.getAddress());
        const energyContract = new ethers.Contract('0x260e03F4b53468a81ddB80B9746FD2E199A66e40', IToken.abi, signerProvider);
        const sandContract = new ethers.Contract('0x4d07DEEE968Dbd7548C66EDFb73aD3D1661a2eE8', IToken.abi, signerProvider);
        const siliciumContract = new ethers.Contract('0x756FEB454f5dFB8BB1cf33C76eCE1E7E4360B448', IToken.abi, signerProvider);
        const solarcellContract = new ethers.Contract('0xd65E1F93f03cbd091EB4A4FD0F6107dffb1964Ca', Solarcell.abi, signerProvider);
        const sandMineContract = new ethers.Contract('0xe63147988932774E186cE435906dBdFc23894F3D', IMine.abi, signerProvider);
        const crafterContract = new ethers.Contract('0x2c63c3bC265de5e3FB8203a01C0ADcBAc79f3B99', Crafter.abi, signerProvider);
        setContracts({ energyContract, sandContract, siliciumContract, solarcellContract, sandMineContract, crafterContract });
      } catch (error) {
        setError(JSON.stringify(error));
      }
    }
    init();
    setTimeout(() => setBlockNumber(0), 500);
    provider.on('block', (block) => setBlockNumber(block));
  }, []);
  
  useEffect(() => {
    const fetch = async () => {
      try {
        if (!contracts || !signerAddress) return;
        const energyDecimals = await contracts.energyContract.decimals();
        setEnergyBalance(parseFloat(ethers.formatUnits((await contracts.energyContract.balanceOf(signerAddress)).toString(), energyDecimals)));
        setSandBalance(parseFloat(ethers.formatUnits((await contracts.sandContract.balanceOf(signerAddress)).toString(), await contracts.sandContract.decimals())));
        setSiliciumBalance(parseFloat(ethers.formatUnits((await contracts.siliciumContract.balanceOf(signerAddress)).toString(), await contracts.siliciumContract.decimals())));
        const solarcellIds = range(await contracts.solarcellContract.nextTokenId() as bigint);
        const ownedSolarcellIds = zip(solarcellIds, await Promise.all(solarcellIds.map(id => contracts.solarcellContract.ownerOf(id) as Promise<string>))).filter(record => record[1] === signerAddress).map(record => record[0]);
        const solarcells = zip(ownedSolarcellIds, await Promise.all(ownedSolarcellIds.map(id => contracts.solarcellContract.getAvailableResources(id) as Promise<bigint>))).map(record => [record[0], ethers.formatUnits(record[1].toString(), energyDecimals)]) as [number, string][];
        setSolarcells(solarcells);
      } catch (error) {
        setError(JSON.stringify(error));
      }
    }
    setError(undefined);
    fetch();
  }, [blockNumber]);
  
  return (
    <>
      <h1>EconomyGame DApp</h1>
      { !!error && (<code>{ error }</code>) }
      <p>Block Number: { blockNumber }</p>
      <p>Address: { signerAddress }</p>
      <p>Energy Balance: { energyBalance }</p>
      <p>Sand Balance: { sandBalance }</p>
      <p>Silicium Balance: { siliciumBalance }</p>
      <p>Solarcells: { JSON.stringify(solarcells) }</p>
      <div>
        { solarcells.map((solarcell, index) => (<button key={ index } onClick={ async () => { 
          try {
            await contracts?.solarcellContract.withdraw(solarcell[0]);
          } catch (error) {
            setError(JSON.stringify(error));
          }
        } }>Retrieve Solarcell { solarcell[0] }</button>)) }
      </div>
      <div>
        <button onClick={ async () => {
          try {
            const remainingApproval = await contracts?.energyContract.allowance(signerAddress, contracts.sandMineContract);
            if (remainingApproval < 1000n) {
              await contracts?.energyContract.approve(contracts.sandMineContract, ethers.parseEther('1000'));
            }
            await contracts?.sandMineContract.mine();
          } catch (error) {
            setError(JSON.stringify(error));
          }
        } }>Mine</button>
        <button onClick={ async () => {
          try {
            await contracts?.sandMineContract.retrieve();
          } catch (error) {
            setError(JSON.stringify(error));
          }
        } }>Withdraw</button>
      </div>
      <div>
        <button onClick={ async () => {
          try {
            let remainingApproval = await contracts?.energyContract.allowance(signerAddress, contracts.crafterContract);
            if (remainingApproval < 1000n) {
              await contracts?.energyContract.approve(contracts.crafterContract, ethers.parseEther('1000'));
            }
            remainingApproval = await contracts?.sandContract.allowance(signerAddress, contracts.crafterContract);
            if (remainingApproval < 1000n) {
              await contracts?.sandContract.approve(contracts.crafterContract, ethers.parseEther('1000'));
            }
            await contracts?.crafterContract.refine(contracts.siliciumContract, { value: ethers.parseUnits('1', 'gwei') });
          } catch (error) {
            setError(JSON.stringify(error));
          }
        } }>Refine Sand to Silicium</button>
      </div>
      <div>
        <button disabled={ !(energyBalance >= 10 && siliciumBalance >= 5) } onClick={ async () => {
          try {
            let remainingApproval = await contracts?.energyContract.allowance(signerAddress, contracts.crafterContract);
            if (remainingApproval < 1000n) {
              await contracts?.energyContract.approve(contracts.crafterContract, ethers.parseEther('1000'));
            }
            remainingApproval = await contracts?.siliciumContract.allowance(signerAddress, contracts.crafterContract);
            if (remainingApproval < 1000n) {
              await contracts?.siliciumContract.approve(contracts.crafterContract, ethers.parseEther('1000'));
            }
            await contracts?.crafterContract.craft(contracts.solarcellContract, { value: ethers.parseUnits('1', 'gwei') });
          } catch (error) {
            setError(JSON.stringify(error));
          }
        } }>Craft new Solarcell</button>
      </div>
    </>  
  )
};

export default App;
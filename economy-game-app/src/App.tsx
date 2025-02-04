import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import * as Energy from '../../artifacts/contracts/Resources.sol/Energy.json';
import * as Solarcell from '../../artifacts/contracts/Solarcell.sol/Solarcell.json';

interface Contracts {
  energyContract: ethers.Contract,
  solarcellContract: ethers.Contract,
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
  const [energyBalance, setEnergyBalance] = useState<string>('');
  const [solarcells, setSolarcells] = useState<[number, string][]>([]);

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
        const energyContract = new ethers.Contract('0x260e03F4b53468a81ddB80B9746FD2E199A66e40', Energy.abi, signerProvider);
        const solarcellContract = new ethers.Contract('0xd65E1F93f03cbd091EB4A4FD0F6107dffb1964Ca', Solarcell.abi, signerProvider);
        setContracts({ energyContract, solarcellContract });
      } catch (error) {
        console.log(error);
      }
    }
    init();
    setTimeout(() => setBlockNumber(0), 500);
    provider.on('block', (block) => setBlockNumber(block));
  }, []);
  
  useEffect(() => {
    const fetch = async () => {
      try {
        if (!!contracts && !!signerAddress) {
          const decimals = await contracts.energyContract.decimals();
          setEnergyBalance(ethers.formatUnits((await contracts.energyContract.balanceOf(signerAddress)).toString(), decimals));
          const maxTokenId = await contracts.solarcellContract.nextTokenId() as bigint;
          const tokenIds = range(maxTokenId);
          const ownedSolarcells = zip(tokenIds, await Promise.all(tokenIds.map(id => contracts.solarcellContract.ownerOf(id) as Promise<string>))).filter(record => record[1] === signerAddress).map(record => record[0]);
          const solarcells = zip(ownedSolarcells, await Promise.all(ownedSolarcells.map(id => contracts.solarcellContract.getAvailableResources(id) as Promise<bigint>))).map(record => [record[0], ethers.formatUnits(record[1].toString(), decimals)]) as [number, string][];
          setSolarcells(solarcells);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetch();
  }, [blockNumber]);
  
  return (
    <>
      <h1>EconomyGame DApp</h1>
      <p>Block Number: { blockNumber }</p>
      <p>Address: { signerAddress }</p>
      <p>Balance: { energyBalance }</p>
      <p>Solarcells: { JSON.stringify(solarcells) }</p>
      { solarcells.map((solarcell, index) => (<button key={ index } onClick={ async () => { await contracts?.solarcellContract.withdraw(solarcell[0]); console.log('Click') } }>Retrieve Solarcell { solarcell[0] }</button>)) }
    </>  
  )
};

export default App;
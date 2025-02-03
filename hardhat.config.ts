import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const BRAKIDCHAIN_PRIVATE_KEY = vars.get("BRAKIDCHAIN_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false
  },
  networks: {
    brakidchain: {
      url: 'http://raspberrypi.fritz.box:8545',
      chainId: 1339,
      accounts: [BRAKIDCHAIN_PRIVATE_KEY],
      gas: "auto"
    },
  }
};

export default config;
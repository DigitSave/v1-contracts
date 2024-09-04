import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
let secret = require('./.secret.json');

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    liskTestnet: {
      url: secret.liskTestnetRPC,
      accounts: [secret.privateKeyTestnet],
    },
  },
  etherscan: {
    apiKey: {
      liskTestnet: secret.listscanAPI,
    }
  },
  sourcify:{
    enabled:true
  }

};

export default config;

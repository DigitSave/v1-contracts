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
    assetChainTestnet: {
      url: secret.assetChainTestnetRPC,
      accounts: [secret.privateKeyTestnet],
    },
  },
  etherscan: {
    apiKey: {
      liskTestnet: secret.listscanAPI,
      assetChainTestnet: secret.assetChainAPI,
    },
    customChains: [
      {
        network: "liskTestnet",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      },
      {
        network: "assetChainTestnet",
        chainId: 42421,
        urls: {
          apiURL: "https://scan-testnet.assetchain.org//api",
          browserURL: "https://scan-testnet.assetchain.org/" 
        }
      }
    ]
  },
  sourcify:{
    enabled:true
  }

};

export default config;


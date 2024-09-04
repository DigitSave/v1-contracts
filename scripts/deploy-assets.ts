import hre, { ethers } from "hardhat";
import fs from "fs-extra";
import path from "path";

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const filePath = path.join(__dirname, "addresses", `${network}.json`);
  let addresses = {} as any;

  if (fs.existsSync(filePath)) {
    addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  // Deploy DigitSaveStorage contract
  const feeCollector = deployerAddress;
  const DigitSaveStorage = await ethers.getContractFactory("DigitSaveStorage");
  const digitSaveStorage = DigitSaveStorage.attach(addresses.DigitSaveStorage);

  const USDT = await ethers.getContractFactory("USDT");
  const usdt = await USDT.deploy();
  await usdt.deploymentTransaction()?.wait();
  const usdtAddress = await usdt.getAddress();
  addresses["usdtAddress"] = usdtAddress;
  console.log(`usdt deployed to: ${usdtAddress}`);

  const BTC = await ethers.getContractFactory("BTC");
  const btc = await BTC.deploy();
  await btc.deploymentTransaction()?.wait();
  const btcAddress = await btc.getAddress();
  addresses["btcAddress"] = btcAddress;
  console.log(`btc deployed to: ${btcAddress}`);

  const ETH = await ethers.getContractFactory("ETH");
  const eth = await ETH.deploy();
  await eth.deploymentTransaction()?.wait();
  const ethAddress = await eth.getAddress();
  addresses["ethAddress"] = ethAddress;
  console.log(`eth deployed to: ${ethAddress}`);

  const LINK = await ethers.getContractFactory("LINK");
  const link = await LINK.deploy();
  await link.deploymentTransaction()?.wait();
  const linkAddress = await link.getAddress();
  addresses["linkAddress"] = linkAddress;
  console.log(`link deployed to: ${linkAddress}`);

  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy();
  await usdc.deploymentTransaction()?.wait();
  const usdcAddress = await usdc.getAddress();
  addresses["usdcAddress"] = usdcAddress;
  console.log(`usdc deployed to: ${usdcAddress}`);

  // Update addresses JSON file
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

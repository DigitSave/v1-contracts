import hre , { ethers } from "hardhat";
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
  const digitSaveStorage = await DigitSaveStorage.deploy(deployerAddress,feeCollector);

  await digitSaveStorage.deploymentTransaction()?.wait();
  const digitSaveStorageAddress = await digitSaveStorage.getAddress(); 

  console.log(`DigitSaveStorage deployed to: ${digitSaveStorageAddress}`);

  // Update addresses JSON file
  addresses["DigitSaveStorage"] = digitSaveStorageAddress;
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

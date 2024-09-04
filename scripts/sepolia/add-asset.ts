import hre , { ethers } from "hardhat";
import fs from "fs-extra";
import path from "path";
import { SepolinaAssets } from "../../test/fixtures/asset";
import { DigitSaveStorage  as IDigitSaveStorage} from "../../typechain-types";


async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const filePath = path.join(__dirname, "../" ,"addresses", `${network}.json`);
  let addresses = {} as any;
  
  if (fs.existsSync(filePath)) {
    addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }


  // Deploy DigitSaveStorage contract
  const feeCollector = deployerAddress; 
  const DigitSaveStorage = await ethers.getContractFactory("DigitSaveStorage");
  const digitSaveStorage = DigitSaveStorage.attach(addresses.DigitSaveStorage) as IDigitSaveStorage;



  const assetData = Object.values(SepolinaAssets)
  for (let i = 0; i < assetData.length; i++) {
      const asset = assetData[i];
      await digitSaveStorage.addAsset(asset.address, asset.aggregator, true);
  }



  // Update addresses JSON file
 console.log("Asset aggregation completed",addresses.DigitSaveStorage);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

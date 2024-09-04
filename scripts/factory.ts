import hre, { ethers } from "hardhat";
import fs from "fs-extra";
import path from "path";

async function main() {
    const network = hre.network.name;
    const filePath = path.join(__dirname, "addresses", `${network}.json`);
    let addresses = {} as any;

    if (fs.existsSync(filePath)) {
        addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    if (!addresses.DigitSaveStorage) {
        const text = "--- Deploy storage contract first beofore factory ---"
        console.log(`\x1b[31m${text}\x1b[0m `)
        return;
    }

    // Deploy DigitSaveFactory contract
    const storageAddress = addresses.DigitSaveStorage;
    const DigitSaveFactory = await ethers.getContractFactory("DigitSaveFactory");
    const digitSaveFactory = await DigitSaveFactory.deploy(storageAddress);

    await digitSaveFactory.deploymentTransaction()?.wait();
    const digitSaveFactoryAddress = await digitSaveFactory.getAddress();

    console.log(`DigitSaveFactory deployed to: ${digitSaveFactoryAddress}`);

    // Update addresses JSON file
    addresses["DigitSaveFactory"] = digitSaveFactoryAddress;
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

import hre from "hardhat";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
import { DigitSaveAccount, DigitSaveFactory, Token, DigitSaveStorage } from "../../typechain-types";
import { Signer, AddressLike } from "ethers";
import Assets, { EthHolders } from "./asset";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { tokenToWei, weiToToken } from "../functions";

interface IDeployFixtureResponse {
    admin: Signer,
    user1: Signer,
    user2: Signer,
    user3: Signer,
    feeCollector: Signer,
    digitSaveStorage: DigitSaveStorage,
    digitSaveFactory: DigitSaveFactory
    user1SavingAccount?: DigitSaveAccount,
    user2SavingAccount?: DigitSaveAccount,
    user3SavingAccount?: DigitSaveAccount
    assetData?:any
}

export async function deployContractFixture(): Promise<IDeployFixtureResponse> {
    const [admin, user1, user2, user3, feeCollector] = await hre.ethers.getSigners();

    const DigitSaveStorage = await hre.ethers.getContractFactory("DigitSaveStorage");
    const digitSaveStorage = await DigitSaveStorage.deploy(admin.address, feeCollector.address);

    const DigitSaveFactory = await hre.ethers.getContractFactory("DigitSaveFactory");
    const digitSaveFactory = await DigitSaveFactory.deploy(digitSaveStorage.target);

    return { admin, user1, user2, user3, feeCollector, digitSaveStorage, digitSaveFactory };
}

export async function setStoragePropertyFixture(admin: Signer, storageContract: DigitSaveStorage): Promise<DigitSaveStorage> {
    const assetData = Object.values(Assets)
    for (let i = 0; i < assetData.length; i++) {
        const asset = assetData[i];
        await storageContract.connect(admin).addAsset(asset.address, asset.aggregator, true);
    }
    return storageContract

}

export async function deployTokens(): Promise<any> {
    const USDT = await hre.ethers.getContractFactory('USDT');
    const usdt = await USDT.deploy();
    const usdtAddress = await usdt.getAddress();

    const USDC = await hre.ethers.getContractFactory('USDC');
    const usdc = await USDC.deploy();
    const usdcAddress = await usdc.getAddress();

    const ETH = await hre.ethers.getContractFactory('ETH');
    const eth = await ETH.deploy();
    const ethAddress = await eth.getAddress();

    const LINK = await hre.ethers.getContractFactory('LINK');
    const link = await LINK.deploy();
    const linkAddress = await link.getAddress();
    
    const BTC = await hre.ethers.getContractFactory('BTC');
    const btc = await BTC.deploy();
    const btcAddress = await btc.getAddress();

    let assetData = {...Assets};

   
    assetData.USDT.address = (await usdt.getAddress())
    assetData.USDC.address = (await usdc.getAddress())
    assetData.WETH.address = (await eth.getAddress())
    assetData.LINK.address = (await link.getAddress())
    assetData.WBTC.address = (await btc.getAddress())

    return {usdt,usdc,eth,btc,link,assetData}

}

export async function accountImpersonationAndEthTransferFixture(account: Signer, accountToImpersonate: string): Promise<boolean> {
    const impersonatedSigner = await hre.ethers.getImpersonatedSigner(accountToImpersonate);
    const balance = await hre.ethers.provider.getBalance(accountToImpersonate);
    await impersonatedSigner.sendTransaction({ to: account, value: balance - BigInt(10000) });
    return true;
}

export async function accountImpersonationAndTokenTransferFixture(user: Signer, accountToImpersonate: string, tokenAddress: string,savingAddress:string): Promise<boolean> {
    const impersonatedSigner = await hre.ethers.getImpersonatedSigner(accountToImpersonate);
    const Token = await hre.ethers.getContractFactory("Token");
    const tokenInstance = Token.attach(tokenAddress) as Token;
    const userAddress = await user.getAddress();
    const impersonatorBalance = ((await tokenInstance.balanceOf(accountToImpersonate)));
    if ((impersonatorBalance) <= 0) {
        return false;
    }
    await user.sendTransaction({ to: accountToImpersonate, value: tokenToWei(5) });
    const depositAmount = ((impersonatorBalance).toString());
    await tokenInstance.connect(impersonatedSigner).transfer(userAddress, (depositAmount));
    await tokenInstance.connect(user).approve(savingAddress,depositAmount);
    // console.log(impersonatorBalance, (depositAmount));
    return true;
}


export async function combineDigitSetupFixture(): Promise<IDeployFixtureResponse> {
    const { admin, user1, user2, user3, feeCollector, digitSaveStorage, digitSaveFactory } = await loadFixture(deployContractFixture);
    await setStoragePropertyFixture(admin, digitSaveStorage);
    return { admin, user1, user2, user3, feeCollector, digitSaveStorage, digitSaveFactory };
}

export async function savingCreationFixture(): Promise<IDeployFixtureResponse> {
    const { admin, user1, user2, user3, feeCollector, digitSaveStorage, digitSaveFactory } = await loadFixture(deployContractFixture);

    await digitSaveFactory.connect(user1).createSavingsAccount();
    await digitSaveFactory.connect(user2).createSavingsAccount();
    await digitSaveFactory.connect(user3).createSavingsAccount();

    const DigitSaveAccount = await hre.ethers.getContractFactory("DigitSaveAccount");
    const user1SavingAccount = DigitSaveAccount.attach((await digitSaveFactory.userSavingsContracts(await user1.getAddress()))) as DigitSaveAccount;
    const user2SavingAccount = DigitSaveAccount.attach((await digitSaveFactory.userSavingsContracts(await user2.getAddress()))) as DigitSaveAccount;
    const user3SavingAccount = DigitSaveAccount.attach((await digitSaveFactory.userSavingsContracts(await user3.getAddress()))) as DigitSaveAccount;

    const users = [{ user: user1, savingAccount: await user1SavingAccount.getAddress() }, { user: user2, savingAccount: await user2SavingAccount.getAddress() }, { user: user3, savingAccount: await user3SavingAccount.getAddress() }];

    const {usdt,usdc,eth,btc,link,assetData} = await deployTokens();

    for (const key in assetData) {
        const element = assetData[key];
        await digitSaveStorage.connect(admin).addAsset(element.address, element.aggregator, true);

    }



    for (let i = 0; i < users.length; i++) {
        const account = users[i];
        // console.log(await user.getAddress())
        
            const userAddress = await account.user.getAddress();
            await usdt.mint(userAddress,tokenToWei(5000));
            await usdt.approve(account.savingAccount,tokenToWei(5000))
 
 
            await usdc.mint(userAddress,tokenToWei(5000));
            await usdc.approve(account.savingAccount,tokenToWei(5000))
 


            await eth.mint(userAddress,tokenToWei(5000));
            await eth.approve(account.savingAccount,tokenToWei(5000))
        


            await link.mint(userAddress,tokenToWei(5000));
            await link.approve(account.savingAccount,tokenToWei(5000))



            await btc.mint(userAddress,tokenToWei(5000));
            await btc.approve(account.savingAccount,tokenToWei(5000))
  

        
    }

    return { admin, user1, user2, user3, feeCollector, digitSaveStorage, digitSaveFactory, user1SavingAccount, user2SavingAccount, user3SavingAccount , assetData};
}
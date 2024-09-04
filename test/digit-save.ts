import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { combineDigitSetupFixture, deployContractFixture, savingCreationFixture } from "./fixtures";
import { getEthBalance, getTokenBalanceForUser, tokenToWei, weiToToken } from "./functions";
// import Assets from "./fixtures/asset";
import { AddressLike } from "ethers";
import { DigitSaveAccount } from "../typechain-types";

describe("DigitSave", function () {

  // setting of asset fixtures
  // impersonating account fixtures to fund assets

  describe("Deployment", function () {
    it("Should deploy all contracts and set the right properties", async function () {
      const { admin, digitSaveStorage, digitSaveFactory } = await loadFixture(combineDigitSetupFixture);
      expect(parseFloat(await getEthBalance(await admin.getAddress()))).to.be.lessThan(10000);
      expect((await digitSaveFactory.getAllSavingAccount()).length).to.equal(0)
      expect((await digitSaveFactory.storageAddress())).to.equal(await digitSaveStorage.getAddress());
    });

  });

  describe("Functionality", function () {
    it("Should create saving account and add asset", async function () {
      const { user1, user1SavingAccount } = await loadFixture(savingCreationFixture);
      const savingName = hre.ethers.encodeBytes32String("My school fee");
      const lockPeriodInMonths = 2;
      const currentSavingId = await user1SavingAccount?.savingId();
      const totalTime = (await time.latest()) + (lockPeriodInMonths * 30 * 86400);
      await user1SavingAccount?.connect(user1).createSaving(savingName, lockPeriodInMonths);
      const newSavingId = await user1SavingAccount?.savingId();
      expect(Number(currentSavingId) + 1).to.equal(Number(newSavingId));
      const saving = await user1SavingAccount?.connect(user1).savings(Number(currentSavingId));
      expect(Number(saving?.id)).to.equal(Number(currentSavingId));
      expect(Number(saving?.totalAssetLocked)).to.equal(0);
      expect(Number(saving?.totalDepositInUSD)).to.equal(0);
      expect(Number(saving?.totalWithdrawnInUSD)).to.equal(0);
      expect(Number(saving?.lockPeriod)).to.greaterThanOrEqual(totalTime);
      expect(hre.ethers.decodeBytes32String(saving?.name as any)).to.equal("My school fee");
    });

    it("should successfully add asset to savings", async function () {
      const { user1, user1SavingAccount, digitSaveStorage , assetData:Assets } = await loadFixture(savingCreationFixture);
      const lockPeriodInMonths = 2;
      const currentSavingId = await user1SavingAccount?.savingId();
      await user1SavingAccount?.connect(user1).createSaving(hre.ethers.encodeBytes32String("My school fee"), lockPeriodInMonths);
      const WrappedEth = Assets.WETH
      const assetDetail = (await digitSaveStorage.getAssetDetail(WrappedEth.id));
      expect(WrappedEth.address.toString().toLowerCase()).to.equal(assetDetail.asset.toLowerCase());
      const amountToDeposit = 10;
      const userWrappedEthBalanceBeforeDeposit = parseFloat(weiToToken(await getTokenBalanceForUser(WrappedEth.address.toString(), (await user1.getAddress()))));
      expect((userWrappedEthBalanceBeforeDeposit)).to.greaterThan(amountToDeposit);
      await user1SavingAccount?.connect(user1).addAsset(Number(currentSavingId), { assetId: WrappedEth.id, amount: tokenToWei(amountToDeposit) });
      const userWrappedEthBalanceAfterDeposit = parseFloat(weiToToken(await getTokenBalanceForUser(WrappedEth.address.toString(), (await user1.getAddress()))));
      expect(userWrappedEthBalanceAfterDeposit).to.equal(userWrappedEthBalanceBeforeDeposit - amountToDeposit);
      const assets = (await user1SavingAccount?.getSavingsAssets(WrappedEth.id)) as DigitSaveAccount.AssetLockedStructOutput[];
      const WrappedEthDeposited = assets[0];
      expect(parseInt(weiToToken(WrappedEthDeposited.amount))).to.equal(amountToDeposit);
      expect(parseInt(weiToToken(WrappedEthDeposited.amountDepositedInUsd))).to.greaterThanOrEqual(amountToDeposit * parseInt(weiToToken(assetDetail.price)));
      expect(parseFloat(weiToToken(WrappedEthDeposited.amountWithdrawnInUsd))).to.equal(0);
    });

    it("topUpAsset", async function () {
      const { user1, user1SavingAccount, digitSaveStorage,assetData:Assets } = await loadFixture(savingCreationFixture);
      const lockPeriodInMonths = 2;
      const currentSavingId = await user1SavingAccount?.savingId();
      await user1SavingAccount?.connect(user1).createSaving(hre.ethers.encodeBytes32String("My school fee"), lockPeriodInMonths);
      const WrappedEth = Assets.WETH
      const assetDetail = (await digitSaveStorage.getAssetDetail(WrappedEth.id));
      expect(WrappedEth.address.toString().toLowerCase()).to.equal(assetDetail.asset.toLowerCase());
      const amountToDeposit = 10;
      const userWrappedEthBalanceBeforeDeposit = parseFloat(weiToToken(await getTokenBalanceForUser(WrappedEth.address.toString(), (await user1.getAddress()))));
      expect((userWrappedEthBalanceBeforeDeposit)).to.greaterThan(amountToDeposit);
      await user1SavingAccount?.connect(user1).addAsset(Number(currentSavingId), { assetId: WrappedEth.id, amount: tokenToWei(amountToDeposit) });
      await user1SavingAccount?.connect(user1).topUpAsset(Number(currentSavingId), { assetId: WrappedEth.id, amount: tokenToWei(amountToDeposit) });
      const assets = (await user1SavingAccount?.getSavingsAssets(WrappedEth.id)) as DigitSaveAccount.AssetLockedStructOutput[];
      const WrappedEthDeposited = assets[0];
      expect(parseInt(weiToToken(WrappedEthDeposited.amount))).to.equal(2 * amountToDeposit);
      expect(parseInt(weiToToken(WrappedEthDeposited.amountDepositedInUsd))).to.greaterThanOrEqual(2 * amountToDeposit * parseInt(weiToToken(assetDetail.price)));
      expect(parseFloat(weiToToken(WrappedEthDeposited.amountWithdrawnInUsd))).to.equal(0);
    });

    it("extendLockPeriod", async function () {
      const { user1, user1SavingAccount, digitSaveStorage } = await loadFixture(savingCreationFixture);
      const lockPeriodInMonths = 2;
      const currentSavingId = 1;
      const timeBeforeSavings = await time.latest()
      await user1SavingAccount?.connect(user1).createSaving(hre.ethers.encodeBytes32String("My school fee"), lockPeriodInMonths);
      let savings = await user1SavingAccount?.connect(user1).savings(1);
      let timeInDays = ((savings?.lockPeriod as any)?.toString() - timeBeforeSavings) / 86400;
      expect(timeInDays).to.greaterThanOrEqual(30 * lockPeriodInMonths)
      await user1SavingAccount?.connect(user1).extendLockPeriod(currentSavingId, lockPeriodInMonths);
      savings = await user1SavingAccount?.connect(user1).savings(1);
      timeInDays = ((savings?.lockPeriod as any)?.toString() - timeBeforeSavings) / 86400;
      expect(timeInDays).to.greaterThanOrEqual(30 * lockPeriodInMonths * 2)
    });

    it("withdrawAsset", async function () {

    });

    it("withdrawAllAsset", async function () {

    });
  });

  describe("State Management", function () {
    it("Ensure mappings are updated correctly", async function () {

    });
  });

  describe("Event Tests", function () {
    it("Ensure proper events are emitted", async function () {

    });
  });

  describe("Edge Case Tests", function () {
    it("Test with various scenarios", async function () {

    });
  });

});






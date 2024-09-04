import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { combineDigitSetupFixture } from "./fixtures";
import { bigIntToNumber, getEthBalance, weiToToken } from "./functions";
import { expect } from "chai";
import Assets from "./fixtures/asset";

describe("DigitSaveStorage", function () {
  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { admin, digitSaveStorage } = await loadFixture(combineDigitSetupFixture);
      expect(Number(await digitSaveStorage.assetId())).to.be.greaterThan(1);
      expect(Number(await digitSaveStorage.maximumAssetPerSavings())).to.equal(10);
      expect(Number(await digitSaveStorage.minimumAssetLockPeriodInMonths())).to.equal(1);
      expect((await digitSaveStorage.owner())).to.equal((await admin.getAddress()));
    });
  });

  describe("Functionality", function () {
    it("getAssetDetail", async function () {
      const { admin, digitSaveStorage } = await loadFixture(combineDigitSetupFixture);
      const totalAssets = Number(await digitSaveStorage.assetId());
      const _assets = Object.values(Assets)
      for (let i = 1; i < totalAssets; i++) {
        const localAsset = _assets[i - 1];
        // console.log(localAsset.name);
        const storageAsset = await digitSaveStorage.getAssetDetail(i);
        const price = weiToToken(storageAsset.price)
        expect(storageAsset.asset.toLowerCase()).to.equal(localAsset.address.toString().toLowerCase());
        expect(parseFloat(price)).to.greaterThan(0);
      }
    });

    it("setMaximumAssetPerSavings", async function () {
      const { digitSaveStorage } = await loadFixture(combineDigitSetupFixture);
      expect(Number(await digitSaveStorage.maximumAssetPerSavings())).to.equal(10);
      await digitSaveStorage.setMaximumAssetPerSavings(30);
      expect(Number(await digitSaveStorage.maximumAssetPerSavings())).to.equal(30);
    });

    it("setMinimumAssetLockPeriod", async function () {
      const { digitSaveStorage } = await loadFixture(combineDigitSetupFixture);
      expect(Number(await digitSaveStorage.minimumAssetLockPeriodInMonths())).to.equal(1);
      await digitSaveStorage.setMinimumAssetLockPeriod(10);
      expect(Number(await digitSaveStorage.minimumAssetLockPeriodInMonths())).to.equal(10);
    });

    it("setFeeCollector", async function () {
      const { admin, digitSaveStorage, feeCollector } = await loadFixture(combineDigitSetupFixture);
      expect((await digitSaveStorage.feeTo())).to.equal((await feeCollector.getAddress()));
      await digitSaveStorage.setFeeCollector((await admin.getAddress()));
      expect((await digitSaveStorage.feeTo())).to.equal(await admin.getAddress());
    });

    it("updateAsset", async function () {

    });
  });

  describe("Access Control", function () {
    it("Should revert if a non-owner tries to call owner-only functions", async function () {

    });
  });

  describe("Internal Functions", function () {
    it("Ensure internal functions perform validations correctly", async function () {

    });
  });
});



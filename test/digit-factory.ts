import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { combineDigitSetupFixture, deployContractFixture } from "./fixtures";
import { getEthBalance } from "./functions";


describe("DigitSaveFactory", function () {
  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      const { admin, digitSaveStorage, digitSaveFactory } = await loadFixture(combineDigitSetupFixture);
      expect(parseFloat(await getEthBalance(await admin.getAddress()))).to.be.lessThan(10000);
      expect((await digitSaveFactory.getAllSavingAccount()).length).to.equal(0)
      expect((await digitSaveFactory.storageAddress())).to.equal(await digitSaveStorage.getAddress());
    });
  });

  describe("Functionality", function () {
    it("Should create a savings account", async function () {
      const { user1,digitSaveFactory } = await loadFixture(combineDigitSetupFixture);
      const user1Address = await user1.getAddress()
      expect((await digitSaveFactory.getAllSavingAccount()).length).to.equal(0);
      await digitSaveFactory.connect(user1).createSavingsAccount();
      const allSavingAccount = await digitSaveFactory.getAllSavingAccount();
      expect(allSavingAccount.length).to.equal(1);
      expect(allSavingAccount[0]).to.length.is.greaterThan(12);
      const newSaving = await digitSaveFactory.userSavingsContracts(user1Address);
      expect(newSaving).to.equal(allSavingAccount[0]);

      // test for reverts
      await expect( digitSaveFactory.connect(user1).createSavingsAccount()).to.be.revertedWithCustomError(digitSaveFactory,"TransactionFailed").withArgs("Saving contract already exist");
    });

    it("Should set new saving account owner", async function () {
      const { user1,user2,user3, digitSaveFactory } = await loadFixture(combineDigitSetupFixture);
      expect((await digitSaveFactory.getAllSavingAccount()).length).to.equal(0);

      await digitSaveFactory.connect(user1).createSavingsAccount();
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();

      const newSaving = await digitSaveFactory.userSavingsContracts(user1Address);
      expect(newSaving).to.not.be.equal("0x0000000000000000000000000000000000000000");

      await digitSaveFactory.connect(user1).setNewSavingAccountOwner(user2Address)
      expect(await digitSaveFactory.userSavingsContracts(user1Address)).to.equal("0x0000000000000000000000000000000000000000");
      expect(await digitSaveFactory.userSavingsContracts(user2Address)).to.not.equal("0x0000000000000000000000000000000000000000");
      const allSavingAccount = await digitSaveFactory.getAllSavingAccount();
      expect(allSavingAccount.length).to.equal(1);

      //test for reverts
      await digitSaveFactory.connect(user3).createSavingsAccount();

      await expect( digitSaveFactory.connect(user1).setNewSavingAccountOwner(user1Address)).to.be.revertedWithCustomError(digitSaveFactory,"TransactionFailed").withArgs("Savings account does not exist");

      await expect( digitSaveFactory.connect(user2).setNewSavingAccountOwner(user3Address)).to.be.revertedWithCustomError(digitSaveFactory,"TransactionFailed").withArgs("New account already has savings");

    });
  });

  describe("State Management", function () {
    it("Should update all mappings correctly", async function () {
      const { user1,user2,user3,digitSaveFactory } = await loadFixture(combineDigitSetupFixture);
      const user1Address = await user1.getAddress();
      const user2Address = await user2.getAddress();
      const user3Address = await user3.getAddress();

      expect((await digitSaveFactory.getAllSavingAccount()).length).to.equal(0);

      await digitSaveFactory.connect(user1).createSavingsAccount();
      await digitSaveFactory.connect(user2).createSavingsAccount();
      await digitSaveFactory.connect(user3).createSavingsAccount();

      const allSavingAccount = await digitSaveFactory.getAllSavingAccount();
      expect(allSavingAccount.length).to.equal(3);

      const newSaving1 = await digitSaveFactory.userSavingsContracts(user1Address);
      const newSaving2 = await digitSaveFactory.userSavingsContracts(user2Address);
      const newSaving3 = await digitSaveFactory.userSavingsContracts(user3Address);

      expect(newSaving1).to.equal(allSavingAccount[0]);
      expect(newSaving2).to.equal(allSavingAccount[1]);
      expect(newSaving3).to.equal(allSavingAccount[2]);

      
    });
  });

  describe("Event Tests", function () {
    it("Should make sure proper events are emitted", async function () {

      const { user1,user2,user3, digitSaveFactory } = await loadFixture(combineDigitSetupFixture);
      const user1Address = await user1.getAddress();
      await expect( digitSaveFactory.connect(user1).createSavingsAccount()).to.emit(digitSaveFactory,"SavingsContractCreated").withArgs(user1Address,anyValue,anyValue);

      const user2Address = await user2.getAddress();
      await expect( digitSaveFactory.connect(user1).setNewSavingAccountOwner(user2Address)).to.emit(digitSaveFactory,"SavingsAccountOwnershipTransfered").withArgs(user1Address,user2Address,anyValue);

    });
  });
});

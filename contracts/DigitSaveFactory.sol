// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./DigitSaveAccount.sol";
import "hardhat/console.sol";

contract DigitSaveFactory {
    error TransactionFailed(string message);
    mapping(address => address) public userSavingsContracts; //user => digit-save-account
    address[] private allSavingsContract;
    address public storageAddress;
    event SavingsContractCreated(
        address indexed user,
        address indexed savingsContract,
        uint indexed date
    );
    event SavingsAccountOwnershipTransfered(
        address indexed oldUser,
        address indexed newOwner,
        uint indexed date
    );

    constructor(address _storageAddress) {
        storageAddress = _storageAddress;
    }

    function _isSavingExist(address _user) private view {
        if (userSavingsContracts[_user] != address(0)) {
            revert TransactionFailed("Saving contract already exist");
        }
    }

    function getAllSavingAccount() external view returns (address[] memory accounts) {
        return allSavingsContract;
    }

    function createSavingsAccount() external returns (address) {
        _isSavingExist(msg.sender);
        DigitSaveAccount saving = new DigitSaveAccount(
            msg.sender,
            storageAddress
        );
        userSavingsContracts[msg.sender] = address(saving);
        allSavingsContract.push(address(saving));
        emit SavingsContractCreated(
            msg.sender,
            address(saving),
            block.timestamp
        );
        return userSavingsContracts[msg.sender];
    }


}

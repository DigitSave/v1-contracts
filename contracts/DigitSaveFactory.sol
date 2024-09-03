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

        function setNewSavingAccountOwner(
        address _newOwner
    ) external returns (bool) {
        if (userSavingsContracts[msg.sender] == address(0)) {
            revert TransactionFailed("Savings account does not exist");
        }

        if (userSavingsContracts[_newOwner] != address(0)) {
            revert TransactionFailed("New account already has savings");
        }

        if (_newOwner == msg.sender) {
            revert TransactionFailed("Invalid user");
        }
        console.log(address(this),"this contract");
        address savingContract = userSavingsContracts[msg.sender];
        (bool success , ) = savingContract.call(abi.encodeWithSignature("transferOwnership(address)",msg.sender, _newOwner));
        if(!success){
            revert TransactionFailed("ownership failed to transfer");
        }
        userSavingsContracts[_newOwner] = userSavingsContracts[msg.sender];
        userSavingsContracts[msg.sender] = address(0);
        emit SavingsAccountOwnershipTransfered(
            msg.sender,
            _newOwner,
            block.timestamp
        );
        return true;
    }


}

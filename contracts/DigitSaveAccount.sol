// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./dependencies/Ownable.sol";


contract DigitSaveAccount is Ownable {
    error TransactionFailed(string message);

   
    constructor(address _owner, address _storageAddress) Ownable(_owner) {

    }

   
}

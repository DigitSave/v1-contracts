// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./dependencies/Ownable.sol";
import "./interfaces/IDigitSaveStorage.sol";
import "./interfaces/IERC20.sol";

contract DigitSaveAccount is Ownable {
    error TransactionFailed(string message);

    struct Saving {
        uint id;
        uint totalDepositInUSD;
        uint totalWithdrawnInUSD;
        uint totalAssetLocked;
        uint lockPeriod;
        bool isCompleted;
        bytes32 name;
    }

    struct AssetLocked {
        uint assetId;
        uint amount;
        uint amountDepositedInUsd;
        uint amountWithdrawnInUsd;
        uint time;
    }
    struct AssetParams {
        uint assetId;
        uint amount;
    }
    mapping(uint => Saving) public savings; // savingId = savings;
    mapping(uint => AssetLocked[]) private assetsLocked; // savings
    uint public savingId;
    uint public platformFee = 1;
    uint public scale = 10000;
    address public storageAddress;

    event SavingCreated(uint indexed id, uint indexed date);
    event SavingCompleted(uint indexed id, uint indexed date);
    event AssetAdded(uint indexed assetId, uint indexed date, uint amount);
    event AssetToppedUp(uint indexed assetId, uint indexed date, uint amount);
    event AssetWithdrawn(
        uint indexed savingId,
        uint indexed assetId,
        uint indexed date,
        uint amount
    );

    constructor(address _owner, address _storageAddress) Ownable(_owner) {
        savingId = 1;
        storageAddress = _storageAddress;
    }

    function _isSavingName(bytes32 _name) internal pure {
        if (_name == bytes32(0)) {
            revert TransactionFailed("Invalid savings name");
        }
    }

    function _isSavingValid(uint _savingId) internal view {
        if (savings[_savingId].isCompleted) {
            revert TransactionFailed("Savings is completed");
        }
    }

    function _isNotZero(uint _amount) internal pure {
        if (_amount <= 0) {
            revert TransactionFailed("Zero value");
        }
    }

    function _isAssetCountValid(
        uint _maxCount,
        uint _currentAssetCount
    ) internal pure {
        if (_currentAssetCount > _maxCount) {
            revert TransactionFailed("Asset count exceeded");
        }
    }

    function _isLockPeriodValid(
        uint _minLockPeriod,
        uint _lockPeriod
    ) internal pure {
        if (_lockPeriod < _minLockPeriod) {
            revert TransactionFailed("Invalid lock period");
        }
    }

    function _isAssetAlreadyExistInSavings(
        uint _savingId,
        uint _assetId
    ) internal view {
        AssetLocked[] memory _assetsLocked = assetsLocked[_savingId];
        for (uint i = 0; i < _assetsLocked.length; i++) {
            if (_assetsLocked[i].assetId == _assetId) {
                revert TransactionFailed("Asset already exist");
            }
        }
    }

    function _isSavingQualifiedForCompletion(
        uint _savingId
    ) internal view returns (bool) {
        AssetLocked[] memory _assetsLocked = assetsLocked[_savingId];
        uint counter;
        for (uint i = 0; i < _assetsLocked.length; i++) {
            if (_assetsLocked[i].amount == 0) {
                counter++;
            }
        }
        if (counter == _assetsLocked.length) {
            return true;
        } else {
            return false;
        }
    }

    function _checkBalanceAndTransfer(
        address _token,
        address _user,
        address _spender,
        uint _amount
    ) internal returns (bool) {
        IERC20 token = IERC20(_token);
        uint balance = token.balanceOf(_user);
        if (balance < _amount) {
            revert TransactionFailed("Insufficient balance");
        }
        uint allowance = token.allowance(_user, _spender);
        if (allowance < _amount) {
            revert TransactionFailed("Insufficient allowance");
        }

        bool result = token.transferFrom(_user, _spender, _amount);
        if (!result) {
            revert TransactionFailed("Transfer failed");
        }
        return result;
    }

    function _payoutAsset(
        address _token,
        address _user,
        address _feeTo,
        uint _amount
    ) internal returns (bool result) {
        IERC20 token = IERC20(_token);
        uint balance = token.balanceOf(address(this));
        if (balance < _amount) {
            revert TransactionFailed("Insufficient saving balance");
        }
        uint fee = (platformFee * _amount) / scale;
        uint amountToRecieve = _amount - fee;
        if (amountToRecieve > 0) {
            result = token.transferFrom(address(this), _user, amountToRecieve);
            if (!result) {
                revert TransactionFailed("Transfer failed");
            }
        } else {
            revert TransactionFailed("Insufficient payout amount");
        }
        if (fee > 0) {
            bool feePayment = token.transferFrom(address(this), _feeTo, fee);
            if (!feePayment) {
                revert TransactionFailed("Fee Transfer failed");
            }
        }

        return result;
    }

    function createSaving(
        bytes32 _name,
        uint _lockPeriodInMonths
    ) external onlyOwner returns (uint newId) {
        _isSavingName(_name);
        IDigitSaveStorage storageObj = IDigitSaveStorage(storageAddress);
        _isLockPeriodValid(
            storageObj.minimumAssetLockPeriodInMonths(),
            _lockPeriodInMonths
        );
        savings[savingId] = Saving(
            savingId,
            0,
            0,
            0,
            (block.timestamp + (_lockPeriodInMonths * 30 * 86400)),
            false,
            _name
        );
        emit SavingCreated(savingId, block.timestamp);
        newId = savingId;
        savingId++;
    }

    function addAsset(
        uint _savingId,
        AssetParams memory _asset
    ) external onlyOwner returns (bool) {
        _isNotZero(_savingId);
        _isSavingValid(_savingId);
        IDigitSaveStorage storageObj = IDigitSaveStorage(storageAddress);
        _isAssetAlreadyExistInSavings(_savingId, _asset.assetId);
        _isNotZero(_asset.amount);
        (address asset, uint price) = storageObj.getAssetDetail(_asset.assetId);
        _checkBalanceAndTransfer(
            asset,
            _msgSender(),
            address(this),
            _asset.amount
        );
        uint usdValue = (price * _asset.amount)/ 1 ether;
        savings[_savingId].totalDepositInUSD += usdValue;
        savings[_savingId].totalAssetLocked += 1;
        assetsLocked[_savingId].push(
            AssetLocked(_asset.assetId, _asset.amount, usdValue, 0,block.timestamp)
        );
        emit AssetAdded(_asset.assetId, block.timestamp, _asset.amount);
        return true;
    }

    function topUpAsset(
        uint _savingId,
        AssetParams memory _asset
    ) external onlyOwner returns (bool) {
        _isNotZero(_savingId);
        _isSavingValid(_savingId);
        _isNotZero(_asset.amount);
        IDigitSaveStorage storageObj = IDigitSaveStorage(storageAddress);
        (address asset, uint price) = storageObj.getAssetDetail(_asset.assetId);
        _checkBalanceAndTransfer(
            asset,
            _msgSender(),
            address(this),
            _asset.amount
        );
        uint usdValue = (price * _asset.amount)/1 ether;
        AssetLocked[] storage _assetsLocked = assetsLocked[_savingId];
        bool assetExist = false;
        for (uint256 i = 0; i < _assetsLocked.length; i++) {
            if (_assetsLocked[i].assetId == _asset.assetId) {
                _assetsLocked[i].amount += _asset.amount;
                _assetsLocked[i].amountDepositedInUsd += usdValue;
                assetExist = true;
            }
        }
        savings[_savingId].totalDepositInUSD += usdValue;
        emit AssetToppedUp(_asset.assetId, block.timestamp, _asset.amount);
        return true;
    }

    function extendLockPeriod(
        uint _savingId,
        uint _lockPeriodInMonth
    ) external onlyOwner returns (uint lockPeriodInSeconds) {
        _isNotZero(_savingId);
        _isSavingValid(_savingId);
        IDigitSaveStorage storageObj = IDigitSaveStorage(storageAddress);
        _isLockPeriodValid(
            storageObj.minimumAssetLockPeriodInMonths(),
            _lockPeriodInMonth
        );
        lockPeriodInSeconds = _lockPeriodInMonth * 30 * 86400;
        savings[_savingId].lockPeriod += lockPeriodInSeconds;
    }

    function withdrawAsset(
        uint _savingId,
        AssetParams memory _asset
    ) external onlyOwner returns (bool) {
        _isNotZero(_savingId);
        _isSavingValid(_savingId);
        IDigitSaveStorage storageObj = IDigitSaveStorage(storageAddress);
        if (savings[_savingId].lockPeriod > block.timestamp) {
            revert TransactionFailed("Lock period still valid");
        }
        (address asset, uint price) = storageObj.getAssetDetail(_asset.assetId);
        _payoutAsset(asset, _msgSender(), storageObj.feeTo(), _asset.amount);
        uint usdValue = price * _asset.amount;
        AssetLocked[] storage _assetsLocked = assetsLocked[_savingId];
        for (uint256 i = 0; i < _assetsLocked.length; i++) {
            if (_assetsLocked[i].assetId == _asset.assetId) {
                if (_assetsLocked[i].amount < _asset.amount) {
                    revert TransactionFailed("Withdrawal amount exceeds");
                }
                _assetsLocked[i].amount -= _asset.amount;
                _assetsLocked[i].amountWithdrawnInUsd += usdValue;
            }
        }
        savings[_savingId].totalWithdrawnInUSD += usdValue;
        if (_isSavingQualifiedForCompletion(_savingId)) {
            savings[_savingId].isCompleted = true;
            emit SavingCompleted(_savingId, block.timestamp);
        }
        emit AssetWithdrawn(
            _savingId,
            _asset.assetId,
            block.timestamp,
            _asset.amount
        );
        return true;
    }

    function withdrawAllAsset(
        uint _savingId
    ) external onlyOwner returns (bool) {
        _isNotZero(_savingId);
        _isSavingValid(_savingId);
        IDigitSaveStorage storageObj = IDigitSaveStorage(storageAddress);
        if (savings[_savingId].lockPeriod > block.timestamp) {
            revert TransactionFailed("Lock period still valid");
        }

        AssetLocked[] storage _assets = assetsLocked[_savingId];
        uint totalUsdWithdrawn = 0;
        address feeTo = storageObj.feeTo();
        for (uint256 i = 0; i < _assets.length; i++) {
            (address asset, uint price) = storageObj.getAssetDetail(
                _assets[i].assetId
            );
            uint usdValue = price * _assets[i].amount;
            _assets[i].amountWithdrawnInUsd += usdValue;
            uint amount = _assets[i].amount;
            _assets[i].amount = 0;
            totalUsdWithdrawn += usdValue;
            _payoutAsset(asset, _msgSender(), feeTo, amount);
            emit AssetWithdrawn(
                _savingId,
                _assets[i].assetId,
                block.timestamp,
                amount
            );
        }
        savings[_savingId].totalWithdrawnInUSD += totalUsdWithdrawn;
        savings[_savingId].isCompleted = true;
        emit SavingCompleted(_savingId, block.timestamp);
        return true;
    }

    function getSavingsAssets(
        uint _savingId
    ) external view returns (AssetLocked[] memory assets) {
        _isNotZero(_savingId);
        if (_savingId > savingId) {
            revert TransactionFailed("Invalid saving Id");
        }
        assets = assetsLocked[_savingId];
    }
}

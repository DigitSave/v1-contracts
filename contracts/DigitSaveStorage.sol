// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./interfaces/AggregatorV3Interface.sol";
import "./dependencies/Ownable.sol";


error TransactionFailed(string message);

contract DigitSaveStorage is Ownable {
    struct SupportedAsset {
        uint id;
        address asset;
        address chainLinkAggregator;
        bool isActive;
    }
    mapping(uint => SupportedAsset) public assets;
    address public feeTo;
    uint public assetId;
    uint public maximumAssetPerSavings;
    uint public minimumAssetLockPeriodInMonths;

    constructor(address _owner,address _feeTo) Ownable(_owner) {
        assetId = 1;
        maximumAssetPerSavings = 10;
        minimumAssetLockPeriodInMonths = 1;
        feeTo = _feeTo;
    }

    function _isValidAddress(address _value) internal pure {
        if (_value == address(0)) {
            revert TransactionFailed("Zero Address");
        }
    }

    function _isApprovedAsset(bool _status) internal pure {
        if (!_status) {
            revert TransactionFailed("Asset not supported");
        }
    }

    function _isNotZero(uint _amount) internal pure {
        if (_amount <= 0) {
            revert TransactionFailed("Zero value");
        }
    }

    function _getAssetUsdPrice(
        address _aggregator
    ) private view returns (uint usdPrice) {
        _isValidAddress(_aggregator);
        AggregatorV3Interface dataFeed = AggregatorV3Interface(_aggregator);
        uint8 decimal = dataFeed.decimals();
        (, int answer, , , ) = dataFeed.latestRoundData();
        if(answer <= 0){
            revert TransactionFailed("Price cannot be negative or zero");
        }

        if(decimal > 18){
            uint scaleFactor = 10 ** (decimal - 18);
            usdPrice = uint(answer) / scaleFactor;
        }else{
           usdPrice = uint(answer) * (10 ** (18-decimal));
        }
    }

    function getAssetDetail(
        uint _id
    ) external view returns (address asset, uint price) {
        _isNotZero(_id);
        SupportedAsset memory assetDetail = assets[_id];
        _isApprovedAsset(assetDetail.isActive);
        asset = assetDetail.asset;
        price = _getAssetUsdPrice(assetDetail.chainLinkAggregator);
    }

    function setMaximumAssetPerSavings(
        uint _amount
    ) external onlyOwner returns (bool) {
        _isNotZero(_amount);
        maximumAssetPerSavings = _amount;
        return true;
    }

    function setMinimumAssetLockPeriod(
        uint _durationInMonth
    ) external onlyOwner returns (bool) {
        // _isNotZero(_durationInMonth);
        minimumAssetLockPeriodInMonths = _durationInMonth;
        return true;
    }

    function setFeeCollector(
        address _collector
    ) external onlyOwner returns (bool) {
        _isValidAddress(_collector);
        feeTo = _collector;
        return true;
    }

    function addAsset(
        address _asset,
        address _chainLinkAggregator,
        bool _status
    ) external onlyOwner returns (bool) {
        _isValidAddress(_asset);
        assets[assetId] = SupportedAsset(
            assetId,
            _asset,
            _chainLinkAggregator,
            _status
        );
        assetId++;
        return true;
    }

    function updateAsset(
        uint _assetId,
        address _asset,
        address _chainLinkAggregator,
        bool _status
    ) external onlyOwner returns (bool) {
        _isNotZero(_assetId);
        _isValidAddress(_asset);
        assets[_assetId] = SupportedAsset(
            _assetId,
            _asset,
            _chainLinkAggregator,
            _status
        );
        return true;
    }
}

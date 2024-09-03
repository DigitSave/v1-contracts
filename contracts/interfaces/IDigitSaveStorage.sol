// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDigitSaveStorage {
    struct SupportedAsset {
        uint id;
        address asset;
        address chainLinkAggregator;
        bool isActive;
    }

    function assets(uint _id) external view returns (
        uint id,
        address asset,
        address chainLinkAggregator,
        bool isActive
    );

    function feeTo() external view returns (address);
    function assetId() external view returns (uint);
    function maximumAssetPerSavings() external view returns (uint);
    function minimumAssetLockPeriodInMonths() external view returns (uint);


    function getAssetDetail(uint _id) external view returns (
        address asset,
        uint price
    );

    function setMaximumAssetPerSavings(uint _amount) external returns (bool);
    function setMinimumAssetLockPeriod(uint _durationInMonth) external returns (bool);


    

    function setAsset(
        uint _assetId,
        address _asset,
        address _chainLinkAggregator,
        bool _status
    ) external returns (bool);
}

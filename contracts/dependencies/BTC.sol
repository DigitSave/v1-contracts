// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
pragma solidity ^0.8.20;

contract BTC is ERC20 {
    constructor() ERC20("BTC Token", "BTC") {
        _mint(msg.sender, 1000000000000000000000000);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
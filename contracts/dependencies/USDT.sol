// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
pragma solidity ^0.8.20;

contract USDT is ERC20 {
    constructor() ERC20("USDT Token", "USDT") {
        _mint(msg.sender, 1000000000000000000000000);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
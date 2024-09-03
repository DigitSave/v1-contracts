// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
pragma solidity ^0.8.20;

contract Token is ERC20 {
    constructor() ERC20("Caritas Token", "CRT") {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
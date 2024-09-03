// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
pragma solidity ^0.8.20;

contract LINK is ERC20 {
    constructor() ERC20("LINK Token", "LINK") {
        _mint(msg.sender, 1000000000000000000000000);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
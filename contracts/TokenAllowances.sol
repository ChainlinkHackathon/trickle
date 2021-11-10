// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenAllowances {
    function getAllowance(IERC20 token) external view (uint256 allowance) {
        return token.allowance(msg.sender, this)
    }
}

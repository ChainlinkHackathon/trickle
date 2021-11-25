// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IExchangeInterface {
    function swapExactTokensForTokens(IERC20 _tokenIn, IERC20 _tokenOut, uint256 _amountIn, address _user) external returns (uint256);
}

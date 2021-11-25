// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IUniswapV2Factory } from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract ExchangeAdapter is ReentrancyGuard, Ownable {
    using Address for address payable;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IUniswapV2Router02 public exchangeRouter;

    constructor(IUniswapV2Router02 _exchangeRouter) {
        exchangeRouter = _exchangeRouter;
    }

    function swapExactTokensForTokens(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amountIn,
        address _user
    ) public returns (bool) {
        require(
            _tokenIn != _tokenOut,
            "Input and Output Token have to be distinct"
        );
        console.log("TRANSFER FROM");
        try _tokenIn.transferFrom(_user, address(this), _amountIn) {
            console.log("APPROVE");
            _tokenIn.approve(address(exchangeRouter), _amountIn);
            address[] memory path = new address[](2);
            path[0] = address(_tokenIn);
            path[1] = address(_tokenOut);
            console.log("CALLING EXCHANGE ROUTER");
            exchangeRouter.swapExactTokensForTokens(
                _amountIn,
                0,
                path,
                _user,
                block.timestamp
            )[1];
            console.log("CALLED EXCHANGE ROUTER");
            return true;
        } catch {
            return false;
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ExchangeAdapter } from "./ExchangeAdapter.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

interface KeeperCompatibleInterface {
    function checkUpkeep(bytes calldata checkData)
        external
        returns (bool upkeepNeeded, bytes memory performData);

    function performUpkeep(bytes calldata performData) external;
}

contract Trickle is KeeperCompatibleInterface, ExchangeAdapter {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /* ============ Structs ========== */

    // This struct represents a single recurring order set by a user
    struct RecurringOrder {
        address user;
        uint256 sellAmount;
        uint256 lastExecution;
        uint256 interval;
    }

    // This struct represents the combination of sell / buy token and all the orders for that pair
    struct TokenPair {
        address sellToken;
        address buyToken;
        mapping(bytes32 => RecurringOrder) orders;
        EnumerableSet.Bytes32Set registeredOrders;
    }

    // Data structure to return in checkUpkeep defining which orders will need to get executed
    struct OrdersToExecute {
        bytes32 tokenPairHash;
        bytes32[] orders;
    }

    /* ============ Events ========== */
    event TokenPairCreated(address sellToken, address buyToken);

    event RecurringOrderUpdated(
        address sellToken,
        address buyToken,
        uint256 sellAmount,
        uint256 interval,
        uint256 startTimestamp
    );

    event SwapFailed(bytes32 tokenPairHash, bytes32 orderHash);
    event SwapSucceeded(bytes32 tokenPairHash, bytes32 orderHash);

    /* ============ State Varibles ========== */
    // Enumerable mappings to be able to later iterate over the orders of a single user
    mapping(address => EnumerableSet.Bytes32Set) userToTokenPairList;
    mapping(address => mapping(bytes32 => EnumerableSet.Bytes32Set)) userToOrderHash;

    // Mapping of a hash of sell / buy token on the TokenPair data
    mapping(bytes32 => TokenPair) tokenPairs;
    // Register initialized pairs in an enumerable set to be able to iterate over them
    EnumerableSet.Bytes32Set initializedTokenPairs;

    uint256 public minimumUpkeepInterval;
    uint256 lastUpkeep;

    /* ============ Public Methods ========== */

    /**
    * Creates new instance of Trickle contract
    *
    * @param _minimumUpkeepInterval   Minimum interval between upkeeps independent of users orders
    * @param _exchangeRouter          Address of Sushiswap / UniswapV2 router contract to execute trades against
    *
    */
    constructor(
        uint256 _minimumUpkeepInterval,
        IUniswapV2Router02 _exchangeRouter
    ) public ExchangeAdapter(_exchangeRouter) {
        minimumUpkeepInterval = _minimumUpkeepInterval;
    }

    /**
    * Creates a new recurring order for the given User starting immediately.
    *
    * @param _sellToken        Address of token to sell
    * @param _buyToken         Address of token to buy
    * @param _sellAmount       Amount of sell token to sell in each trade
    * @param _interval         Interval of execution in ms
    *
    */
    function setDca(
        address _sellToken,
        address _buyToken,
        uint256 _sellAmount,
        uint256 _interval
    ) public {
        setDcaWithStartTimestamp(
            _sellToken,
            _buyToken,
            _sellAmount,
            _interval,
            0
        );
    }

    /**
    * Creates a new recurring order for the given User starting from the given block timestamp.
    *
    * @param _sellToken        Address of token to sell
    * @param _buyToken         Address of token to buy
    * @param _sellAmount       Amount of sell token to sell in each trade
    * @param _interval         Interval of execution in ms
    * @param _startTimestamp   Block timestamp from which to start the execution of this order
    *
    */
    function setDcaWithStartTimestamp(
        address _sellToken,
        address _buyToken,
        uint256 _sellAmount,
        uint256 _interval,
        uint256 _startTimestamp
    ) public {
        require(_sellAmount > 0, "amount cannot be 0");
        require(_sellToken != address(0), "sellToken cannot be zero address");
        require(_buyToken != address(0), "buyToken cannot be zero address");
        require(
            _interval > minimumUpkeepInterval,
            "interval has to be greater than minimumUpkeepInterval"
        );
        bytes32 tokenPairHash = keccak256(
            abi.encodePacked(_sellToken, _buyToken)
        );

        TokenPair storage tokenPair = tokenPairs[tokenPairHash];
        if (!initializedTokenPairs.contains(tokenPairHash)) {
            tokenPair.sellToken = _sellToken;
            tokenPair.buyToken = _buyToken;
            initializedTokenPairs.add(tokenPairHash);
            emit TokenPairCreated(_sellToken, _buyToken);
        }
        userToTokenPairList[msg.sender].add(tokenPairHash);

        bytes32 orderHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _sellAmount,
                _interval,
                _startTimestamp
            )
        );
        RecurringOrder storage order = tokenPair.orders[orderHash];
        if (!tokenPair.registeredOrders.contains(orderHash)) {
            order.user = msg.sender;
            tokenPair.registeredOrders.add(orderHash);
        }
        userToOrderHash[msg.sender][tokenPairHash].add(orderHash);

        order.sellAmount = _sellAmount;
        order.lastExecution = _startTimestamp;
        order.interval = _interval;
        emit RecurringOrderUpdated(
            _sellToken,
            _buyToken,
            _sellAmount,
            _interval,
            _startTimestamp
        );
    }

    /**
    * Utility function for frontend to get data on a given order
    *
    * @param _tokenPairHash    Hash of sell and buyToken addresses identifying the tokenPair.
    * @param _orderHash        Hash of remaining order data (user address, amount, interval)
    *
    * @return Instance of RecurringOrder struct containing amount interval etc.
    *
    */
    function getOrderData(bytes32 _tokenPairHash, bytes32 _orderHash)
        external
        view
        returns (RecurringOrder memory)
    {
        TokenPair storage tokenPair = tokenPairs[_tokenPairHash];
        return tokenPair.orders[_orderHash];
    }

    /**
    * Utility function for frontend to get data on a given token pair
    *
    * @param _tokenPairHash    Hash of sell and buyToken addresses identifying the tokenPair.
    *
    * @return Address of token to be sold
    * @return Address of token to be bought
    *
    */
    function getTokenPairData(bytes32 _tokenPairHash)
        external
        view
        returns (address, address)
    {
        TokenPair storage tokenPair = tokenPairs[_tokenPairHash];
        return (tokenPair.sellToken, tokenPair.buyToken);
    }

    /**
    * Utility function for frontend to get all token pairs for which the given user has set orders
    *
    * @param _user    Address of the user for which to query active token pairs
    *
    * @return Array of tokenPair-hashes identifying combinations of sell / buyToken for which the user has active orders
    *
    */
    function getTokenPairs(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 numTokenPairs = userToTokenPairList[_user].length();
        bytes32[] memory tokenPairHashes = new bytes32[](numTokenPairs);
        for (uint256 i; i < numTokenPairs; i++) {
            tokenPairHashes[i] = userToTokenPairList[_user].at(i);
        }
        return tokenPairHashes;
    }

    /**
    * List hashes of active orders for given tokenPair and user
    *
    * @param _user             Address of the user for which to query active token pairs
    * @param _tokenPairHash    Hash of sell and buyToken addresses identifying the tokenPair.
    *
    * @return Array of order-hashes identifying the orders set for given user and token pair
    *
    */
    function getOrders(address _user, bytes32 _tokenPairHash)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 numOrders = userToOrderHash[_user][_tokenPairHash].length();
        bytes32[] memory orderHashes = new bytes32[](numOrders);
        for (uint256 i; i < numOrders; i++) {
            orderHashes[i] = userToOrderHash[_user][_tokenPairHash].at(i);
        }
        return orderHashes;
    }

    /**
    * Check if Upkeep is needed and generate performData
    *
    *
    * @return upkeepNeeded     Boolean indicating wether upkeep needs to be performed
    * @return performData      Serialized array of structs identifying orders to be executed in next upkeep
    *
    */
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (block.timestamp < lastUpkeep + minimumUpkeepInterval) {
            return (upkeepNeeded, performData);
        }

        uint256 numPairs = initializedTokenPairs.length();
        OrdersToExecute[] memory ordersToExecute = new OrdersToExecute[](
            numPairs
        );
        uint256 l;
        for (uint256 i = 0; i < numPairs; i++) {
            bytes32 tokenPairHash = initializedTokenPairs.at(i);
            uint256 numOrders = tokenPairs[tokenPairHash]
                .registeredOrders
                .length();
            if (numOrders > 0) {
                bytes32[] memory orders = new bytes32[](numOrders);
                uint256 k;
                for (uint256 j; j < numOrders; j++) {
                    bytes32 orderHash = tokenPairs[tokenPairHash]
                        .registeredOrders
                        .at(j);
                    RecurringOrder memory order = tokenPairs[tokenPairHash]
                        .orders[orderHash];
                    if (
                        block.timestamp > (order.lastExecution + order.interval)
                    ) {
                        orders[k] = orderHash;
                        k++;
                        upkeepNeeded = true;
                    }
                }
                ordersToExecute[l] = OrdersToExecute(tokenPairHash, orders);
                l++;
            }
        }
        performData = abi.encode(ordersToExecute);
    }

    /**
    * Perform Upkeep executing all pending orders
    *
    * @param performData      Serialized array of structs identifying orders to be executed as returned by checkUpkeep
    *
    */
    function performUpkeep(bytes calldata performData) external override {
        OrdersToExecute[] memory ordersToExecute = abi.decode(
            performData,
            (OrdersToExecute[])
        );
        if (ordersToExecute.length > 0) {
            _executeOrders(ordersToExecute);
        }
    }

    /**
    * Internal helper function to execute all pending orders for all token pairs
    *
    * @param ordersToExecute   Array of structs with one element for each token pair that has pending orders. Each element contains a list of order hashes that need to be executed for this token pair
    *
    */
    function _executeOrders(OrdersToExecute[] memory ordersToExecute) internal {
        for (uint256 i; i < ordersToExecute.length; i++) {
            OrdersToExecute memory order = ordersToExecute[i];
            if (order.tokenPairHash == bytes32(0)) break;
            _executeOrder(order);
        }
    }

    /**
    * Execute orders for one token pair
    *
    * @param order   Struct containing tokenPair hash and list of order hashes that need to be executed for this token pair.
    *
    */
    function _executeOrder(OrdersToExecute memory order) internal {
        if (order.orders.length == 0) return;

        TokenPair storage tokenPair = tokenPairs[order.tokenPairHash];
        IERC20 sellToken = IERC20(tokenPair.sellToken);
        IERC20 buyToken = IERC20(tokenPair.buyToken);
        for (uint256 i; i < order.orders.length; i++) {
            bytes32 orderHash = order.orders[i];
            if (orderHash == bytes32(0)) break;
            RecurringOrder storage recurringOrder = tokenPair.orders[orderHash];
            uint256 sellAmount = recurringOrder.sellAmount;
            address user = recurringOrder.user;
            bool success = swapExactTokensForTokens(
                sellToken,
                buyToken,
                sellAmount,
                user
            );
            if (success) {
                recurringOrder.lastExecution = block.timestamp;
                emit SwapSucceeded(order.tokenPairHash, orderHash);
            } else {
                emit SwapFailed(order.tokenPairHash, orderHash);
            }
        }
    }
}

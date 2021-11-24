// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


interface KeeperCompatibleInterface {
    function checkUpkeep(bytes calldata checkData)
        external
        returns (bool upkeepNeeded, bytes memory performData);

    function performUpkeep(bytes calldata performData) external;
}

contract Trickle is KeeperCompatibleInterface {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    uint256 public counter; // Public counter variable

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

    // Enumerable mappings to be able to later iterate over the orders of a single user
    mapping(address => EnumerableSet.Bytes32Set) userToTokenPairList;
    mapping(address => mapping(bytes32 => EnumerableSet.Bytes32Set)) userToOrderHash;


    // Mapping of a hash of sell / buy token on the TokenPair data
    mapping(bytes32 => TokenPair) tokenPairs;
    // Register initialized pairs in an enumerable set to be able to iterate over them
    EnumerableSet.Bytes32Set initializedTokenPairs;


    // TODO: update conntract ABI
    // address _token_to_buy
    function setDca(address _sellToken, address _buyToken, uint256 _sellAmount, uint256 _interval) public {
        setDca(_sellToken, _buyToken, _sellAmount, _interval, 0);
    }

    function setDca(address _sellToken, address _buyToken, uint256 _sellAmount, uint256 _interval, uint256 _startTimestamp) public {
        require(_sellAmount > 0, "amount cannot be 0");
        bytes32 tokenPairHash = keccak256(abi.encodePacked(_sellToken, _buyToken));

        TokenPair storage tokenPair = tokenPairs[tokenPairHash];
        if(!initializedTokenPairs.contains(tokenPairHash)){
            tokenPair.sellToken = _sellToken;
            tokenPair.buyToken = _buyToken;
            initializedTokenPairs.add(tokenPairHash);
        }
        userToTokenPairList[msg.sender].add(tokenPairHash);

        bytes32 orderHash = keccak256(abi.encodePacked(msg.sender, _sellAmount, _interval, _startTimestamp));
        RecurringOrder storage order = tokenPair.orders[orderHash];
        if(!tokenPair.registeredOrders.contains(orderHash)){
            order.user = msg.sender;
            tokenPair.registeredOrders.add(orderHash);
        }
        userToOrderHash[msg.sender][tokenPairHash].add(orderHash);

        order.sellAmount = _sellAmount;
        order.lastExecution = _startTimestamp;
        order.interval = _interval;
    }

    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint numPairs = initializedTokenPairs.length();
        OrdersToExecute[] memory ordersToExecute = new OrdersToExecute[](numPairs);
        for(uint i = 0; i < numPairs; i++){
            bytes32 tokenPairHash = initializedTokenPairs.at(i);
            uint numOrders = tokenPairs[tokenPairHash].registeredOrders.length();
            if(numOrders > 0){
                bytes32[] memory orders = new bytes32[](numOrders);
                uint k;
                for(uint j; j < numOrders; j++){
                    bytes32 orderHash = tokenPairs[tokenPairHash].registeredOrders.at(j);
                    RecurringOrder memory order = tokenPairs[tokenPairHash].orders[orderHash];
                    if(block.timestamp > (order.lastExecution + order.interval)){
                        orders[k] = orderHash;
                        k++;
                    }

                }
                ordersToExecute[i] = OrdersToExecute(tokenPairHash, orders);
            }

        }
        upkeepNeeded = ordersToExecute.length > 0;
        performData = abi.encode(ordersToExecute);
    }

    function performUpkeep(bytes calldata performData) external override {
        // do stuff with user -> interval and user -> amount here
    }
}

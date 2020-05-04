/*
    Copyright 2019 Set Labs Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import { IDydxPriceOracle } from "../../external/Dydx/interfaces/IDydxPriceOracle.sol";
import { Monetary } from "../../external/Dydx/lib/Monetary.sol";


/**
 * @title DydxOracleAdapter
 * @author Set Protocol
 *
 * Returns output from dYdX's price oracles in uint256 for use in
 * Set OracleProxy system
 */
contract DydxOracleAdapter {

    /* ============ State Variables ============ */
    IDydxPriceOracle public dYdXOracleInstance;
    address public erc20TokenAddress;

    /* ============ Constructor ============ */
    /*
     * Set address of dYdX price oracle being adapted to uint256
     *
     * @param  _dYdXOracleInstance    The address of dYdX oracle being adapted from struct to uint256
     * @param  _erc20TokenAddress     The address of underlying ERC20 token that the oracle is returning
     *                                a value for
     */
    constructor(
        IDydxPriceOracle _dYdXOracleInstance,
        address _erc20TokenAddress
    )
        public
    {
        dYdXOracleInstance = _dYdXOracleInstance;
        erc20TokenAddress = _erc20TokenAddress;
    }

    /* ============ External ============ */

    /*
     * Reads value of struct and returns the value in uint256
     *
     * @returns         dYdX oracle price in uint256
     */
    function read()
        external
        view
        returns (uint256)
    {
        // Get struct and read value in uint256
        Monetary.Price memory price = dYdXOracleInstance.getPrice(erc20TokenAddress);
        return price.value;
    }
}
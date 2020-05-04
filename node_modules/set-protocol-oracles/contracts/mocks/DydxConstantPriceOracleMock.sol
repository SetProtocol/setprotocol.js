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
pragma experimental "ABIEncoderV2";

import { IDydxPriceOracle } from "../external/Dydx/interfaces/IDydxPriceOracle.sol";
import { Monetary } from "../external/Dydx/lib/Monetary.sol";

/**
 * @title DydxConstantPriceOracleMock
 * @author Set Protocol
 *
 * Mock contract that implements a dYdX price oracle interface used for testing
 */
contract DydxConstantPriceOracleMock is 
    IDydxPriceOracle
{

    /* ============ State Variables ============ */
    uint256 public oracleValue;

    /* ============ Constructor ============ */
    /*
     * Set value that the oracle returns
     *
     * @param  _oracleValue    Set the price that will be returned from this oracle
     */
    constructor(
        uint256 _oracleValue
    )
        public
    {
        oracleValue = _oracleValue;
    }

    /* ============ External ============ */

    /*
     * Change oracle value. Warning: no permissions to change the value
     *
     */
    function changeOracleValue(
        uint256 _newOracleValue
    )
        public
    {
        oracleValue = _newOracleValue;
    }

    /*
     * Gets price and returns as a struct.
     *
     * @returns         Struct with value denominated in uint256
     */
    function getPrice(
        address /* token */
    )
        public
        view
        returns (Monetary.Price memory)
    {
        // Return the constant set in the constructor
        return Monetary.Price({ value: oracleValue });
    }
}
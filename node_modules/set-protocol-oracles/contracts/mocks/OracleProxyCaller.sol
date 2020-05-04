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

import { IOracle } from "../meta-oracles/interfaces/IOracle.sol";

/**
 * @title OracleProxyCaller
 * @author Set Protocol
 *
 * Mock contract used to make sure that the OracleProxy can't be called by unauthorized addresses
 * on chain.
 */
contract OracleProxyCaller {

    /* ============ State Variables ============ */
    IOracle public oracleAddress;

    /* ============ Constructor ============ */
    /*
     * Set address of oracle being proxied
     *
     * @param  _oracleAddress    The address of oracle being proxied
     */
    constructor(
        IOracle _oracleAddress
    )
        public
    {
        oracleAddress = _oracleAddress;
    }

    /* ============ External ============ */

    /*
     * Reads value of medianizer and coerces return to uint256. Only authorized addresses are allowed
     * to call read().
     *
     * @returns         Oracle's uint256 output
     */
    function read()
        external
        view
        returns (uint256)
    {
        // Read value of oracle
        return oracleAddress.read();
    }
}
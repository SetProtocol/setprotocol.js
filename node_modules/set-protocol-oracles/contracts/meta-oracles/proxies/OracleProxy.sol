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

import { Authorizable } from "../../external/SetProtocolContracts/lib/Authorizable.sol";

import { IOracle } from "../interfaces/IOracle.sol";


/**
 * @title OracleProxy
 * @author Set Protocol
 *
 * Permissioned contract that acts as a bridge between external Oracles and the whole Set system.
 * OracleProxies help enforce standardization of data types the Set system uses as well as allows
 * for Set to interact with external permissioned oracles through one contract instead of permiss-
 * ioning all contracts that need the external oracle's data. Because the OracleProxy is interacting
 * with permissioned oracles, the OracleProxy must also be permissioned so that only out contracts
 * use it and the oracle data isn't leaked on chain.
 */
contract OracleProxy is
    Authorizable
{

    /* ============ State Variables ============ */
    IOracle public oracleInstance;

    /* ============ Events ============ */

    event LogOracleUpdated(
        address indexed newOracleAddress
    );

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
        oracleInstance = _oracleAddress;
    }

    /* ============ External ============ */

    /*
     * Reads value of external oracle and passed to Set system. Only authorized addresses are allowed
     * to call read().
     *
     * @returns         Oracle's uint256 output
     */
    function read()
        external
        view
        onlyAuthorized
        returns (uint256)
    {
        // Read value of oracle
        return oracleInstance.read();
    }

    /*
     * Sets address of new oracle to be proxied. Only owner has ability to update oracleAddress.
     *
     * @param _newOracleAddress         Address of new oracle being proxied
     */
    function changeOracleAddress(
        IOracle _newOracleAddress
    )
        external
        onlyOwner
        timeLockUpgrade // Must be placed after onlyOwner
    {
        // Check to make sure new oracle address is passed
        require(
            address(_newOracleAddress) != address(oracleInstance),
            "OracleProxy.changeOracleAddress: Must give new oracle address."
        );

        // Set new Oracle instance
        oracleInstance = _newOracleAddress;

        emit LogOracleUpdated(address(_newOracleAddress));
    }
}

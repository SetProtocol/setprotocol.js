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

import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { IOracle } from "../interfaces/IOracle.sol";


/**
 * @title TwoAssetRatioOracle
 * @author Set Protocol
 *
 * Oracle built to adhere to IOracle interface and returns the ratio of a base asset data point
 * divided by a quote asset data point
 */
contract TwoAssetRatioOracle is
    IOracle
{
    using SafeMath for uint256;

    /* ============ State Variables ============ */
    IOracle public baseOracleInstance;
    IOracle public quoteOracleInstance;
    string public dataDescription;

    // Ratio values are scaled by 1e18
    uint256 internal constant scalingFactor = 10 ** 18;

    /* ============ Constructor ============ */
    /*
     * Set price oracle is made to return
     *
     * @param  _baseOracleInstance        The address of base asset oracle
     * @param  _quoteOracleInstance       The address of quote asset oracle
     * @param  _dataDescription           Description of contract for Etherscan / other applications
     */
    constructor(
        IOracle _baseOracleInstance,
        IOracle _quoteOracleInstance,
        string memory _dataDescription
    )
        public
    {
        baseOracleInstance = _baseOracleInstance;
        quoteOracleInstance = _quoteOracleInstance;
        dataDescription = _dataDescription;
    }

    /**
     * Returns the ratio of base to quote data point scaled by 10 ** 18
     *
     * @return   Ratio of base to quote data point in uint256
     */
    function read()
        external
        view
        returns (uint256)
    {
        uint256 baseOracleValue = baseOracleInstance.read();
        uint256 quoteOracleValue = quoteOracleInstance.read();

        // Return most recent data from time series feed
        return baseOracleValue.mul(scalingFactor).div(quoteOracleValue);
    }
} 
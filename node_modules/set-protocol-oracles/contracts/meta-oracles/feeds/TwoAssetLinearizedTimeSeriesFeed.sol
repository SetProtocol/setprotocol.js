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

import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { TimeLockUpgradeV2 } from "../../external/SetProtocolContracts/lib/TimeLockUpgradeV2.sol";

import { DataSourceLinearInterpolationLibrary } from "../lib/DataSourceLinearInterpolationLibrary.sol";
import { IOracle } from "../interfaces/IOracle.sol";
import { LinkedListLibraryV3 } from "../lib/LinkedListLibraryV3.sol";
import { TimeSeriesFeedV2 } from "../lib/TimeSeriesFeedV2.sol";


/**
 * @title TwoAssetLinearizedTimeSeriesFeed
 * @author Set Protocol
 *
 * This TimeSeriesFeed calculates the ratio of base to quote asset and stores it using the
 * inherited TimeSeriesFeedV2 contract. On calculation, if the interpolationThreshold
 * is reached, then it returns a linearly interpolated value.
 */
contract TwoAssetLinearizedTimeSeriesFeed is
    TimeSeriesFeedV2,
    TimeLockUpgradeV2
{
    using SafeMath for uint256;
    using LinkedListLibraryV3 for LinkedListLibraryV3.LinkedList;

    /* ============ State Variables ============ */

    // Amount of time after which read interpolates price result, in seconds
    uint256 public interpolationThreshold;
    string public dataDescription;
    IOracle public baseOracleInstance;
    IOracle public quoteOracleInstance;


    /* ============ Events ============ */

    event LogOracleUpdated(
        address indexed newOracleAddress
    );

    /* ============ Constructor ============ */

    /*
     * Set interpolationThreshold, data description, quote oracle and base oracle and instantiate oracle
     *
     * @param  _updateInterval            Cadence at which data is optimally logged. Optimal schedule is based
                                          off deployment timestamp. A certain data point can't be logged before
                                          it's expected timestamp but can be logged after (for TimeSeriesFeed)
     * @param  _nextEarliestUpdate        Time the first on-chain price update becomes available (for TimeSeriesFeed)
     * @param  _maxDataPoints             The maximum amount of data points the linkedList will hold (for TimeSeriesFeed)
     * @param  _seededValues              Array of previous timeseries values to seed initial values in list.
     *                                    The last value should contain the most current piece of data (for TimeSeriesFeed)
     * @param  _interpolationThreshold    The minimum time in seconds where interpolation is enabled
     * @param  _baseOracleAddress         The address of the base oracle to read current data from
     * @param  _quoteOracleAddress        The address of the quote oracle to read current data from
     * @param  _dataDescription           Description of contract for Etherscan / other applications
     */
    constructor(
        uint256 _updateInterval,
        uint256 _nextEarliestUpdate,
        uint256 _maxDataPoints,
        uint256[] memory _seededValues,
        uint256 _interpolationThreshold,
        IOracle _baseOracleAddress,
        IOracle _quoteOracleAddress,
        string memory _dataDescription
    )
        public
        TimeSeriesFeedV2(
            _updateInterval,
            _nextEarliestUpdate,
            _maxDataPoints,
            _seededValues
        )
    {
        interpolationThreshold = _interpolationThreshold;
        baseOracleInstance = _baseOracleAddress;
        quoteOracleInstance = _quoteOracleAddress;
        dataDescription = _dataDescription;
    }

    /* ============ External ============ */

    /*
     * Change base asset oracle in case current one fails or is deprecated. Only contract
     * owner is allowed to change.
     *
     * @param  _newBaseOracleAddress       Address of new oracle to pull data from
     */
    function changeBaseOracle(
        IOracle _newBaseOracleAddress
    )
        external
        timeLockUpgrade
    {
        // Check to make sure new base oracle address is passed
        require(
            address(_newBaseOracleAddress) != address(baseOracleInstance),
            "TwoAssetLinearizedTimeSeriesFeed.changeBaseOracle: Must give new base oracle address."
        );

        baseOracleInstance = _newBaseOracleAddress;

        emit LogOracleUpdated(address(_newBaseOracleAddress));
    }

    /*
     * Change quote asset oracle in case current one fails or is deprecated. Only contract
     * owner is allowed to change.
     *
     * @param  _newQuoteOracleAddress       Address of new oracle to pull data from
     */
    function changeQuoteOracle(
        IOracle _newQuoteOracleAddress
    )
        external
        timeLockUpgrade
    {
        // Check to make sure new quote oracle address is passed
        require(
            address(_newQuoteOracleAddress) != address(quoteOracleInstance),
            "TwoAssetLinearizedTimeSeriesFeed.changeQuoteOracle: Must give new quote oracle address."
        );

        quoteOracleInstance = _newQuoteOracleAddress;

        emit LogOracleUpdated(address(_newQuoteOracleAddress));
    }

    /* ============ Internal ============ */

    /*
     * Returns the data from the oracle contract. If the current timestamp has surpassed
     * the interpolationThreshold, then the current price is retrieved and interpolated based on
     * the previous value and the time that has elapsed since the intended update value.
     *
     * Returns with newest data point by querying oracle. Is eligible to be
     * called after nextAvailableUpdate timestamp has passed. Because the nextAvailableUpdate occurs
     * on a predetermined cadence based on the time of deployment, delays in calling poke do not propogate
     * throughout the whole dataset and the drift caused by previous poke transactions not being mined
     * exactly on nextAvailableUpdate do not compound as they would if it was required that poke is called
     * an updateInterval amount of time after the last poke.
     *
     * @returns                         Returns the datapoint from the oracle contract
     */
    function calculateNextValue()
        internal
        returns (uint256)
    {
        // Get current base oracle value
        uint256 baseOracleValue = baseOracleInstance.read();

        // Get current quote oracle value
        uint256 quoteOracleValue = quoteOracleInstance.read();

        // Calculate the current base / quote asset ratio with 10 ** 18 precision
        uint256 currentRatioValue = baseOracleValue.mul(10 ** 18).div(quoteOracleValue);

        // Calculate how much time has passed from last expected update
        uint256 timeFromExpectedUpdate = block.timestamp.sub(nextEarliestUpdate);

        // If block timeFromExpectedUpdate is greater than interpolationThreshold we linearize
        // the current price to try to reduce error
        if (timeFromExpectedUpdate < interpolationThreshold) {
            return currentRatioValue;
        } else {
            // Get the previous value
            uint256 previousRatioValue = timeSeriesData.getLatestValue();

            return DataSourceLinearInterpolationLibrary.interpolateDelayedPriceUpdate(
                currentRatioValue,
                updateInterval,
                timeFromExpectedUpdate,
                previousRatioValue
            );
        }
    }
}

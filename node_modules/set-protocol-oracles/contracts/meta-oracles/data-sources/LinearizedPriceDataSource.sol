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
import { TimeLockUpgrade } from "../../external/SetProtocolContracts/lib/TimeLockUpgrade.sol";

import { DataSourceLinearInterpolationLibrary } from "../lib/DataSourceLinearInterpolationLibrary.sol";
import { IOracle } from "../interfaces/IOracle.sol";
import { IDataSource } from "../interfaces/IDataSource.sol";
import { LinkedListHelper } from "../lib/LinkedListHelper.sol";
import { LinkedListLibraryV2 } from "../lib/LinkedListLibraryV2.sol";
import { TimeSeriesStateLibrary } from "../lib/TimeSeriesStateLibrary.sol";


/**
 * @title LinearizedPriceDataSource
 * @author Set Protocol
 *
 * This DataSource returns the current value of the oracle. If the interpolationThreshold
 * is reached, then returns a linearly interpolated value.
 * It is intended to be read by a TimeSeriesFeed smart contract.
 */
contract LinearizedPriceDataSource is
    TimeLockUpgrade,
    IDataSource
{
    using SafeMath for uint256;
    using LinkedListHelper for LinkedListLibraryV2.LinkedList;

    /* ============ State Variables ============ */
    // Amount of time after which read interpolates price result, in seconds
    uint256 public interpolationThreshold;
    string public dataDescription;
    IOracle public oracleInstance;

    /* ============ Events ============ */

    event LogOracleUpdated(
        address indexed newOracleAddress
    );

    /* ============ Constructor ============ */

    /*
     * Set interpolationThreshold, data description, and instantiate oracle
     *
     * @param  _interpolationThreshold    The minimum time in seconds where interpolation is enabled
     * @param  _oracleAddress         The address to read current data from
     * @param  _dataDescription           Description of contract for Etherscan / other applications
     */
    constructor(
        uint256 _interpolationThreshold,
        IOracle _oracleAddress,
        string memory _dataDescription
    )
        public
    {
        interpolationThreshold = _interpolationThreshold;
        oracleInstance = _oracleAddress;
        dataDescription = _dataDescription;
    }

    /* ============ External ============ */

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
     * @param  _timeSeriesState         Struct of TimeSeriesFeed state
     * @returns                         Returns the datapoint from the oracle contract
     */
    function read(
        TimeSeriesStateLibrary.State memory _timeSeriesState
    )
        public
        view
        returns (uint256)
    {
        // Validate that nextEarliest update timestamp is less than current block timestamp
        require(
            block.timestamp >= _timeSeriesState.nextEarliestUpdate,
            "LinearizedPriceDataSource.read: current timestamp must be greater than nextAvailableUpdate."
        );

        // Calculate how much time has passed from last expected update
        uint256 timeFromExpectedUpdate = block.timestamp.sub(_timeSeriesState.nextEarliestUpdate);

        // Get current oracle value
        uint256 oracleValue = oracleInstance.read();

        // If block timeFromExpectedUpdate is greater than interpolationThreshold we linearize
        // the current price to try to reduce error
        if (timeFromExpectedUpdate < interpolationThreshold) {
            return oracleValue;
        } else {
            uint256 mostRecentPrice = _timeSeriesState.timeSeriesData.getLatestValue();

            return DataSourceLinearInterpolationLibrary.interpolateDelayedPriceUpdate(
                oracleValue,
                _timeSeriesState.updateInterval,
                timeFromExpectedUpdate,
                mostRecentPrice
            );
        }
    }

    /*
     * Change oracle in case current one fails or is deprecated. Only contract
     * owner is allowed to change.
     *
     * @param  _newOracleAddress       Address of new oracle to pull data from
     */
    function changeOracle(
        IOracle _newOracleAddress
    )
        external
        onlyOwner
        timeLockUpgrade // Must be placed after onlyOwner
    {
        // Check to make sure new oracle address is passed
        require(
            address(_newOracleAddress) != address(oracleInstance),
            "LinearizedPriceDataSource.changeOracle: Must give new oracle address."
        );

        oracleInstance = _newOracleAddress;

        emit LogOracleUpdated(address(_newOracleAddress));
    }

}

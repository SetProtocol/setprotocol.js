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

import { ReentrancyGuard } from "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";

import { LinkedListLibraryV3 } from "./LinkedListLibraryV3.sol";


/**
 * @title TimeSeriesFeedV2
 * @author Set Protocol
 *
 * Contract used to track time-series data. This is meant to be inherited, as the calculateNextValue
 * function is unimplemented. New data is appended by calling the poke function, which retrieves the
 * latest value using the calculateNextValue function.
 *
 * CHANGELOG
 * - Built to be inherited by contract that implements new calculateNextValue function
 * - Uses LinkedListLibraryV3
 * - nextEarliestUpdate is passed into constructor
 */
contract TimeSeriesFeedV2 is
    ReentrancyGuard
{
    using SafeMath for uint256;
    using LinkedListLibraryV3 for LinkedListLibraryV3.LinkedList;

    /* ============ State Variables ============ */
    uint256 public updateInterval;
    uint256 public maxDataPoints;
    // Unix Timestamp in seconds of next earliest update time
    uint256 public nextEarliestUpdate;

    LinkedListLibraryV3.LinkedList internal timeSeriesData;

    /* ============ Constructor ============ */

    /*
     * Stores time-series values in a LinkedList and updated using data from a specific data source. 
     * Updates must be triggered off chain to be stored in this smart contract.
     *
     * @param  _updateInterval            Cadence at which data is optimally logged. Optimal schedule is based
                                          off deployment timestamp. A certain data point can't be logged before
                                          it's expected timestamp but can be logged after 
     * @param  _nextEarliestUpdate        Time the first on-chain price update becomes available 
     * @param  _maxDataPoints             The maximum amount of data points the linkedList will hold 
     * @param  _seededValues              Array of previous timeseries values to seed initial values in list.
     *                                    The last value should contain the most current piece of data 
     */
    constructor(
        uint256 _updateInterval,
        uint256 _nextEarliestUpdate,
        uint256 _maxDataPoints,
        uint256[] memory _seededValues
    )
        public
    {

        // Check that nextEarliestUpdate is greater than current block timestamp
        require(
            _nextEarliestUpdate > block.timestamp,
            "TimeSeriesFeed.constructor: nextEarliestUpdate must be greater than current timestamp."
        );

        // Check that at least one seeded value is passed in
        require(
            _seededValues.length > 0,
            "TimeSeriesFeed.constructor: Must include at least one seeded value."
        );

        // Check that maxDataPoints greater than 0
        require(
            _maxDataPoints > 0,
            "TimeSeriesFeed.constructor: Max data points must be greater than 0."
        );

        // Check that updateInterval greater than 0
        require(
            _updateInterval > 0,
            "TimeSeriesFeed.constructor: Update interval must be greater than 0."
        );

        // Set updateInterval and maxDataPoints
        updateInterval = _updateInterval;
        maxDataPoints = _maxDataPoints;

        // Define upper data size limit for linked list and input initial value
        timeSeriesData.initialize(_maxDataPoints, _seededValues[0]);

        // Cycle through input values array (skipping first value used to initialize LinkedList)
        // and add to timeSeriesData
        for (uint256 i = 1; i < _seededValues.length; i++) {
            timeSeriesData.editList(_seededValues[i]);
        } 

        // Set nextEarliestUpdate
        nextEarliestUpdate = _nextEarliestUpdate;      
    }

    /* ============ External ============ */

    /*
     * Updates linked list with newest data point by calling the implemented calculateNextValue function
     */
    function poke()
        external
        nonReentrant
    {
        // Make sure block timestamp exceeds nextEarliestUpdate
        require(
            block.timestamp >= nextEarliestUpdate,
            "TimeSeriesFeed.poke: Not enough time elapsed since last update"
        );

        // Get the most current data point
        uint256 newValue = calculateNextValue();

        // Update the nextEarliestUpdate to previous nextEarliestUpdate plus updateInterval
        nextEarliestUpdate = nextEarliestUpdate.add(updateInterval);

        // Update linkedList with new price
        timeSeriesData.editList(newValue);
    }

    /*
     * Query linked list for specified days of data. Will revert if number of days
     * passed exceeds amount of days collected. Will revert if not enough days of
     * data logged.
     *
     * @param  _numDataPoints  Number of datapoints to query
     * @returns                Array of datapoints of length _numDataPoints from most recent to oldest                   
     */
    function read(
        uint256 _numDataPoints
    )
        external
        view
        returns (uint256[] memory)
    {
        return timeSeriesData.readList(_numDataPoints);
    }


    /* ============ Internal ============ */

    function calculateNextValue()
        internal
        returns (uint256);

}
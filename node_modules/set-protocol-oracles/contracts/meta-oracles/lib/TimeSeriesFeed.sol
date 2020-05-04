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

import { IDataSource } from "../interfaces/IDataSource.sol";
import { LinkedListLibraryV2 } from "./LinkedListLibraryV2.sol";
import { TimeSeriesStateLibrary } from "./TimeSeriesStateLibrary.sol";


/**
 * @title TimeSeriesFeed
 * @author Set Protocol
 *
 * Contract used to store time-series data from a specified DataSource. Intended time-series data
 * is stored in a circular Linked List data structure with a maximum number of data points. Its
 * enforces a minimum duration between each update. New data is appended by calling the poke function,
 * which reads data from a specified data source.
 */
contract TimeSeriesFeed is
    ReentrancyGuard
{
    using SafeMath for uint256;
    using LinkedListLibraryV2 for LinkedListLibraryV2.LinkedList;

    /* ============ State Variables ============ */
    uint256 public updateInterval;
    uint256 public maxDataPoints;
    // Unix Timestamp in seconds of next earliest update time
    uint256 public nextEarliestUpdate;
    string public dataDescription;
    IDataSource public dataSourceInstance;

    LinkedListLibraryV2.LinkedList private timeSeriesData;

    /* ============ Constructor ============ */

    /*
     * Stores time-series values in a LinkedList and updated using data from a specific data source. 
     * Updates must be triggered off chain to be stored in this smart contract.
     *
     * @param  _updateInterval            Cadence at which data is optimally logged. Optimal schedule is based
                                          off deployment timestamp. A certain data point can't be logged before
                                          it's expected timestamp but can be logged after. 
     * @param  _maxDataPoints             The maximum amount of data points the linkedList will hold
     * @param  _dataSourceAddress         The address to read current data from
     * @param  _dataDescription           Description of time-series data for Etherscan / other applications
     * @param  _seededValues              Array of previous timeseries values to seed
     *                                    initial values in list. The last value should contain 
     *                                    the most current piece of data
     */
    constructor(
        uint256 _updateInterval,
        uint256 _maxDataPoints,
        IDataSource _dataSourceAddress,
        string memory _dataDescription,
        uint256[] memory _seededValues
    )
        public
    {
        // Set updateInterval, maxDataPoints, data description, dataSourceInstance
        updateInterval = _updateInterval;
        maxDataPoints = _maxDataPoints;
        dataDescription = _dataDescription;
        dataSourceInstance = _dataSourceAddress;

        require(
            _seededValues.length > 0,
            "TimeSeriesFeed.constructor: Must include at least one seeded value."
        );

        // Define upper data size limit for linked list and input initial value
        timeSeriesData.initialize(_maxDataPoints, _seededValues[0]);

        // Cycle through input values array (skipping first value used to initialize LinkedList)
        // and add to timeSeriesData
        for (uint256 i = 1; i < _seededValues.length; i++) {
            timeSeriesData.editList(_seededValues[i]);
        }

        // Set nextEarliestUpdate
        nextEarliestUpdate = block.timestamp.add(updateInterval);
    }

    /* ============ External ============ */

    /*
     * Updates linked list with newest data point by querying the dataSource.
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

        TimeSeriesStateLibrary.State memory timeSeriesState = getTimeSeriesFeedState();

        // Get the most current data point
        uint256 newValue = dataSourceInstance.read(timeSeriesState);

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

    /* ============ Public ============ */

    /*
     * Generate struct that holds TimeSeriesFeed's current nextAvailableUpdate, updateInterval,
     * and the LinkedList struct
     *
     * @returns                Struct containing the above params                  
     */
    function getTimeSeriesFeedState()
        public
        view
        returns (TimeSeriesStateLibrary.State memory)
    {
        return TimeSeriesStateLibrary.State({
            nextEarliestUpdate: nextEarliestUpdate,
            updateInterval: updateInterval,
            timeSeriesData: timeSeriesData
        });
    }
}
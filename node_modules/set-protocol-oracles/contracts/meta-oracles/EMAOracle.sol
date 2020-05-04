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
import { TimeLockUpgrade } from "../external/SetProtocolContracts/lib/TimeLockUpgrade.sol";

import { ITimeSeriesFeed } from "./interfaces/ITimeSeriesFeed.sol";
import { IMetaOracleV2 } from "./interfaces/IMetaOracleV2.sol";


/**
 * @title EMAOracle
 * @author Set Protocol
 *
 * The EMA Oracle is a Proxy library that allows the indexing of existing EMA feeds and the retrieval
 * of addresses using the IMetaOracleV2 interface.
 *
 */
contract EMAOracle is
    TimeLockUpgrade,
    IMetaOracleV2
{
    using SafeMath for uint256;

    /* ============ Events ============ */

    event FeedAdded(
        address indexed newFeedAddress,
        uint256 indexed emaDays
    );

    event FeedRemoved(
        address indexed removedFeedAddress,
        uint256 indexed emaDays
    );

    /* ============ State Variables ============ */
    string public dataDescription;

    // Mapping of EMA Days to Time Series Feeds
    mapping(uint256 => ITimeSeriesFeed) public emaTimeSeriesFeeds;

    /* ============ Constructor ============ */

    /*
     * Contract used to provide a common interface to retrieve the most recent
     * EMA value of a specific EMA days time series feed.
     *
     * @param  _timeSeriesFeed          List of time series feed addresses
     * @param  _emaTimePeriods          List of EMA Days that correspond with feed addresses
     * @param  _dataDescription         Description of data
     */
    constructor(
        ITimeSeriesFeed[] memory _timeSeriesFeeds,
        uint256[] memory _emaTimePeriods,
        string memory _dataDescription
    )
        public
    {
        dataDescription = _dataDescription;

        // Require that the feeds inputted and days are the same
        require(
            _timeSeriesFeeds.length == _emaTimePeriods.length,
            "EMAOracle.constructor: Input lengths must be equal"
        );

        // Loop through the feeds and add to the mapping
        for (uint256 i = 0; i < _timeSeriesFeeds.length; i++) {
            uint256 emaDay = _emaTimePeriods[i];
            emaTimeSeriesFeeds[emaDay] = _timeSeriesFeeds[i];
        }
    }

    /*
     * Get the current EMA value for a specific time period.
     *
     * @param  _emaTimePeriods   Number of days in time period
     * @returns                  EMA value for passed number of EMA time period
     */
    function read(
        uint256 _emaTimePeriod
    )
        external
        view
        returns (uint256)
    {
        ITimeSeriesFeed emaFeedInstance = emaTimeSeriesFeeds[_emaTimePeriod];

        // EMA Feed must be added
        require(
            address(emaFeedInstance) != address(0),
            "EMAOracle.read: Feed does not exist"
        );

        // Get the current EMA value. The most current value is the first index
        return emaFeedInstance.read(1)[0];
    }

    /*
     * Add a feed address with the mapping of tracked time series feeds
     * Can only be called by owner.
     *
     * @param  _feedAddress      Address of the EMA time series feed
     * @param  _emaTimePeriod    Number of days in EMA time period
     */
    function addFeed(
        ITimeSeriesFeed _feedAddress,
        uint256 _emaTimePeriod
    )
        external
        onlyOwner
    {
        require(
            address(emaTimeSeriesFeeds[_emaTimePeriod]) == address(0),
            "EMAOracle.addFeed: Feed has already been added"
        );

        emaTimeSeriesFeeds[_emaTimePeriod] = _feedAddress;

        emit FeedAdded(address(_feedAddress), _emaTimePeriod);
    }

    /*
     * Removes a feed address with the mapping of tracked time series feeds
     * Can only be called by owner. Is a timeLockUpgrade operation.
     *
     * @param  _emaTimePeriod   Number of days in EMA time period
     */
    function removeFeed(uint256 _emaTimePeriod)
        external
        onlyOwner
        timeLockUpgrade // Must be placed after onlyOwner
    {
        address emaTimeSeriesFeed = address(emaTimeSeriesFeeds[_emaTimePeriod]);

        require(
            emaTimeSeriesFeed != address(0),
            "EMAOracle.removeFeed: Feed does not exist."
        );

        delete emaTimeSeriesFeeds[_emaTimePeriod];

        emit FeedRemoved(emaTimeSeriesFeed, _emaTimePeriod);
    }
}

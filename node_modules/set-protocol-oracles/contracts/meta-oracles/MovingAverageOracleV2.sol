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
import { ITimeSeriesFeed } from "./interfaces/ITimeSeriesFeed.sol";


/**
 * @title MovingAverageOracleV2
 * @author Set Protocol
 *
 * Contract used calculate moving average of data points provided by other on-chain
 * price feed and return to querying contract.
 * CHANGELOG:
 *  - Updated from version one to read from ITimeSeriesFeed 
 *  - Outputs uint256 instead of bytes
 *  - getSourceMedianizer() function removed.
 */
contract MovingAverageOracleV2 {

    using SafeMath for uint256;

    /* ============ State Variables ============ */
    string public dataDescription;
    ITimeSeriesFeed public timeSeriesFeedInstance;

    /* ============ Constructor ============ */

    /*
     * MovingAverageOracleV2 constructor.
     * Contract used calculate moving average of data points provided by other on-chain
     * price feed and return to querying contract
     *
     * @param  _timeSeriesFeed          TimeSeriesFeed to get list of data from
     * @param  _dataDescription         Description of data
     */
    constructor(
        ITimeSeriesFeed _timeSeriesFeed,
        string memory _dataDescription
    )
        public
    {
        timeSeriesFeedInstance = _timeSeriesFeed;

        dataDescription = _dataDescription;
    }

    /*
     * Get moving average over defined amount of data points by querying price feed and
     * averaging returned data. Returns uint256.
     *
     * @param  _dataPoints       Number of data points to create average from
     * @returns                  Moving average for passed number of _dataPoints
     */
    function read(
        uint256 _dataPoints    
    )
        external
        view
        returns (uint256)
    {
        // Get data from price feed
        uint256[] memory dataArray = timeSeriesFeedInstance.read(_dataPoints);

        // Sum data retrieved from daily price feed
        uint256 dataSum = 0;
        for (uint256 i = 0; i < dataArray.length; i++) {
            dataSum = dataSum.add(dataArray[i]);
        }

        // Return average price
        return dataSum.div(_dataPoints);
    }
}
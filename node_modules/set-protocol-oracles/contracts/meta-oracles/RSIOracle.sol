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
import { RSILibrary } from "./lib/RSILibrary.sol";


/**
 * @title RSIOracle
 * @author Set Protocol
 *
 * Contract used calculate RSI of data points provided by other on-chain
 * price feed and return to querying contract.
 */
contract RSIOracle {

    using SafeMath for uint256;

    /* ============ State Variables ============ */
    string public dataDescription;
    ITimeSeriesFeed public timeSeriesFeedInstance;

    /* ============ Constructor ============ */

    /*
     * RSIOracle constructor.
     * Contract used to calculate RSI of data points provided by other on-chain
     * price feed and return to querying contract.
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
     * Get RSI over defined amount of data points by querying price feed and
     * calculating using RSILibrary. Returns uint256.
     *
     * @param  _rsiTimePeriod    RSI lookback period
     * @returns                  RSI value for passed number of _rsiTimePeriod
     */
    function read(
        uint256 _rsiTimePeriod    
    )
        external
        view
        returns (uint256)
    {
        // RSI period must be at least 1
        require(
            _rsiTimePeriod >= 1,
            "RSIOracle.read: RSI time period must be at least 1"
        );

        // Get data from price feed. This will be +1 the lookback period
        uint256[] memory dataArray = timeSeriesFeedInstance.read(_rsiTimePeriod.add(1));

        // Return RSI calculation
        return RSILibrary.calculate(dataArray);
    }
}
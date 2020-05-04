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


/**
 * @title LinearInterpolationLibrary
 * @author Set Protocol
 *
 * Library used to determine linearly interpolated value for DataSource contracts when TimeSeriesFeed
 * is updated after interpolationThreshold has passed.
 */
library DataSourceLinearInterpolationLibrary {
    using SafeMath for uint256;

    /* ============ External ============ */

    /*
     * When the update time has surpassed the currentTime + interpolationThreshold, linearly interpolate the 
     * price between the current time and price and the last updated time and price to reduce potential error. This
     * is done with the following series of equations, modified in this instance to deal unsigned integers:
     *
     * price = (currentPrice * updateInterval + previousLoggedPrice * timeFromExpectedUpdate) / timeFromLastUpdate 
     *
     * Where updateTimeFraction represents the fraction of time passed between the last update and now spent in
     * the previous update window. It's worth noting that because we consider updates to occur on their update
     * timestamp we can make the assumption that the amount of time spent in the previous update window is equal
     * to the update frequency. 
     * 
     * By way of example, assume updateInterval of 24 hours and a interpolationThreshold of 1 hour. At time 1 the
     * update is missed by one day and when the oracle is finally called the price is 150, the price feed
     * then interpolates this price to imply a price at t1 equal to 125. Time 2 the update is 10 minutes late but
     * since it's within the interpolationThreshold the value isn't interpolated. At time 3 everything 
     * falls back in line.
     *
     * +----------------------+------+-------+-------+-------+
     * |                      | 0    | 1     | 2     | 3     |
     * +----------------------+------+-------+-------+-------+
     * | Expected Update Time | 0:00 | 24:00 | 48:00 | 72:00 |
     * +----------------------+------+-------+-------+-------+
     * | Actual Update Time   | 0:00 | 48:00 | 48:10 | 72:00 |
     * +----------------------+------+-------+-------+-------+
     * | Logged Px            | 100  | 125   | 151   | 130   |
     * +----------------------+------+-------+-------+-------+
     * | Received Oracle Px   | 100  | 150   | 151   | 130   |
     * +----------------------+------+-------+-------+-------+
     * | Actual Price         | 100  | 110   | 151   | 130   |
     * +------------------------------------------------------     
     *
     * @param  _currentPrice                Current price returned by oracle
     * @param  _updateInterval              Update interval of TimeSeriesFeed
     * @param  _timeFromExpectedUpdate      Time passed from expected update
     * @param  _previousLoggedDataPoint     Previously logged price from TimeSeriesFeed
     * @returns                             Interpolated price value                  
     */
    function interpolateDelayedPriceUpdate(
        uint256 _currentPrice,
        uint256 _updateInterval,
        uint256 _timeFromExpectedUpdate,
        uint256 _previousLoggedDataPoint
    )
        internal
        pure
        returns (uint256)
    {
        // Calculate how much time has passed from timestamp corresponding to last update
        uint256 timeFromLastUpdate = _timeFromExpectedUpdate.add(_updateInterval);

        // Linearly interpolate between last updated price (with corresponding timestamp) and current price (with
        // current timestamp) to imply price at the timestamp we are updating
        return _currentPrice.mul(_updateInterval)
            .add(_previousLoggedDataPoint.mul(_timeFromExpectedUpdate))
            .div(timeFromLastUpdate);      
    }
}
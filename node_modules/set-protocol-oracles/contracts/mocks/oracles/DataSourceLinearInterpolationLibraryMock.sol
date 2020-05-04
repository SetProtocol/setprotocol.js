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

import { DataSourceLinearInterpolationLibrary } from "../../meta-oracles/lib/DataSourceLinearInterpolationLibrary.sol";

/**
 * @title LinearInterpolationLibrary
 * @author Set Protocol
 *
 * Library used to determine linearly interpolated value for DataSource contracts when TimeSeriesFeed
 * is updated after interpolationThreshold has passed.
 */
contract DataSourceLinearInterpolationLibraryMock {

    function interpolateDelayedPriceUpdateMock(
        uint256 _currentPrice,
        uint256 _updateInterval,
        uint256 _timeFromExpectedUpdate,
        uint256 _previousLoggedDataPoint
    )
        external
        returns (uint256)
    {
        return DataSourceLinearInterpolationLibrary.interpolateDelayedPriceUpdate(
            _currentPrice,
            _updateInterval,
            _timeFromExpectedUpdate,
            _previousLoggedDataPoint
        );
    }
}
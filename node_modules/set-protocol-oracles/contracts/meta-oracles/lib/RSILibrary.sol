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
 * @title RSILibrary
 * @author Set Protocol
 *
 * Library for calculating the Relative Strength Index
 * 
 */
library RSILibrary{

    using SafeMath for uint256;

    /* ============ Constants ============ */
    
    uint256 public constant HUNDRED = 100;

    /*
     * Calculates the new relative strength index value using
     * an array of prices.
     *
     * RSI = 100 − 100 / 
     *       (1 + (Gain / Loss))
     *
     * Price Difference = Price(N) - Price(N-1) where N is number of days
     * Gain = Sum(Positive Price Difference)
     * Loss = -1 * Sum(Negative Price Difference)
     *
     *
     * Our implementation is simplified to the following for efficiency
     * RSI = (100 * SUM(Gain)) / (SUM(Loss) + SUM(Gain))
     *
     *
     * @param  _dataArray               Array of prices used to calculate the RSI
     * @returns                         The RSI value
     */
    function calculate(
        uint256[] memory _dataArray
    )
        internal
        pure
        returns (uint256)
    {   
        uint256 positiveDataSum = 0;
        uint256 negativeDataSum = 0;

        // Check that data points must be greater than 1
        require(
            _dataArray.length > 1,
            "RSILibrary.calculate: Length of data array must be greater than 1"
        );

        // Sum negative and positive price differences
        for (uint256 i = 1; i < _dataArray.length; i++) {
            uint256 currentPrice = _dataArray[i - 1];
            uint256 previousPrice = _dataArray[i];
            if (currentPrice > previousPrice) {
                positiveDataSum = currentPrice.sub(previousPrice).add(positiveDataSum);
            } else {
                negativeDataSum = previousPrice.sub(currentPrice).add(negativeDataSum);
            }
        }

        // Check that there must be a positive or negative price change
        require(
            negativeDataSum > 0 || positiveDataSum > 0,
            "RSILibrary.calculate: Not valid RSI Value"
        );
        
        // a = 100 * SUM(Gain)
        uint256 a = HUNDRED.mul(positiveDataSum);
        // b = SUM(Gain) + SUM(Loss) 
        uint256 b = positiveDataSum.add(negativeDataSum);

        return a.div(b);
    }
}
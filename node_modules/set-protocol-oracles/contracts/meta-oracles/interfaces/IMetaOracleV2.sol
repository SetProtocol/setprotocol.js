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


/**
 * @title IMetaOracleV2
 * @author Set Protocol
 *
 * Interface for operating with any MetaOracleV2 (moving average, bollinger, etc.)
 *
 * CHANGELOG:
 *  - read returns uint256 instead of bytes
 */
interface IMetaOracleV2 {

    /**
     * Returns the queried data from a meta oracle.
     *
     * @return  Current price of asset in uint256
     */
    function read(
        uint256 _dataDays
    )
        external
        view
        returns (uint256);
}
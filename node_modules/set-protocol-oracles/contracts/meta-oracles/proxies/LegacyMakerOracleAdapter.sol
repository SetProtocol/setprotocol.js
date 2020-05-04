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

import { IMedian } from "../../external/DappHub/interfaces/IMedian.sol";


/**
 * @title LegacyMakerOracleAdapter
 * @author Set Protocol
 *
 * Coerces bytes outputs from MakerDAO's legacy medianizers into uint256 for use in
 * Set OracleProxy system
 */
contract LegacyMakerOracleAdapter {

    /* ============ State Variables ============ */
    IMedian public medianizerInstance;

    /* ============ Constructor ============ */
    /*
     * Set address of medianizer being adapted from bytes to uint256
     *
     * @param  _medianizerAddress    The address of medianizer being adapted from bytes to uint256
     */
    constructor(
        IMedian _medianizerAddress
    )
        public
    {
        medianizerInstance =_medianizerAddress;
    }

    /* ============ External ============ */

    /*
     * Reads value of medianizer and coerces return to uint256
     *
     * @returns         Maker medianizer price in uint256
     */
    function read()
        external
        view
        returns (uint256)
    {
        // Read value of medianizer and coerce to uint256
        return uint256(medianizerInstance.read());
    }
}
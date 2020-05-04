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

import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { IMedian } from "../../external/DappHub/interfaces/IMedian.sol";
import { LinkedListLibrary } from "../lib/LinkedListLibrary.sol";


/**
 * @title HistoricalPriceFeed
 * @author Set Protocol
 *
 * Contract used to store Historical price data from an off-chain oracle
 */
contract HistoricalPriceFeed is
    Ownable,
    LinkedListLibrary
{
    using SafeMath for uint256;

    /* ============ Constants ============ */
    uint256 constant DAYS_IN_DATASET = 200;

    /* ============ State Variables ============ */
    uint256 public updateFrequency;
    uint256 public lastUpdatedAt;
    string public dataDescription;
    IMedian public medianizerInstance;

    LinkedList public historicalPriceData;

    /* ============ Constructor ============ */

    /*
     * Historical Price Feed constructor.
     * Stores Historical prices according to passed in oracle address. Updates must be 
     * triggered off chain to be stored in this smart contract.
     *
     * @param  _updateFrequency           How often new data can be logged, passe=d in seconds
     * @param  _medianizerAddress         The oracle address to read historical data from
     * @param  _dataDescription           Description of data in Data Bank
     * @param  _seededValues              Array of previous days' Historical price values to seed
     *                                    initial values in list. Should NOT contain the current
     *                                    days price.
     */
    constructor(
        uint256 _updateFrequency,
        address _medianizerAddress,
        string memory _dataDescription,
        uint256[] memory _seededValues
    )
        public
    {
        // Set medianizer address, data description, and instantiate medianizer
        updateFrequency = _updateFrequency;
        dataDescription = _dataDescription;
        medianizerInstance = IMedian(_medianizerAddress);

        // Create initial values array from _seededValues and current price
        uint256[] memory initialValues = createInitialValues(_seededValues);

        // Define upper data size limit for linked list and input initial value
        initialize(
            historicalPriceData,
            DAYS_IN_DATASET,
            initialValues[0]
        );

        // Cycle through input values array (skipping first value used to initialize LinkedList)
        // and add to historicalPriceData
        for (uint256 i = 1; i < initialValues.length; i++) {
            editList(
                historicalPriceData,
                initialValues[i]
            );
        }

        // Set last updated timestamp
        lastUpdatedAt = block.timestamp;
    }

    /* ============ External ============ */

    /*
     * Updates linked list with newest data point by querying medianizer. Is eligible to be
     * called every 24 hours.
     */
    function poke()
        external
    {
        // Make sure 24 hours have passed since last update
        require(
            block.timestamp >= lastUpdatedAt.add(updateFrequency),
            "HistoricalPriceFeed: Not enough time passed between updates"
        );

        // Update the timestamp to current block timestamp; Prevents re-entrancy
        lastUpdatedAt = block.timestamp;

        // Get current price
        uint256 newValue = uint256(medianizerInstance.read());

        // Update linkedList with new price
        editList(
            historicalPriceData,
            newValue
        );
    }

    /*
     * Query linked list for specified days of data. Will revert if number of days
     * passed exceeds amount of days collected. Will revert if not enough days of
     * data logged.
     *
     * @param  _dataDays       Number of days of data being queried
     * @returns                Array of historical price data of length _dataDays                   
     */
    function read(
        uint256 _dataDays
    )
        external
        view
        returns (uint256[] memory)
    {
        return readList(
            historicalPriceData,
            _dataDays
        );
    }

    /*
     * Change medianizer in case current one fails or is deprecated. Only contract
     * owner is allowed to change.
     *
     * @param  _newMedianizerAddress       Address of new medianizer to pull data from
     */
    function changeMedianizer(
        address _newMedianizerAddress
    )
        external
        onlyOwner
    {
        medianizerInstance = IMedian(_newMedianizerAddress);
    }


    /* ============ Private ============ */

    /*
     * Create initialValues array from _seededValues and the current medianizer price.
     * Added to historicalPriceData in constructor.
     *
     * @param  _seededValues        Array of previous days' historical price values to seed
     * @returns                     Array of initial values to add to historicalPriceData                  
     */
    function createInitialValues(
        uint256[] memory _seededValues
    )
        private
        returns (uint256[] memory)
    {
        // Get current value from medianizer
        uint256 currentValue = uint256(medianizerInstance.read());

        // Instantiate outputArray
        uint256 seededValuesLength = _seededValues.length;
        uint256[] memory outputArray = new uint256[](seededValuesLength.add(1));

        // Take values from _seededValues array and add to outputArray
        for (uint256 i = 0; i < _seededValues.length; i++) {
            outputArray[i] = _seededValues[i];
        }

        // Add currentValue to outputArray
        outputArray[seededValuesLength] = currentValue;

        return outputArray;
    }
}
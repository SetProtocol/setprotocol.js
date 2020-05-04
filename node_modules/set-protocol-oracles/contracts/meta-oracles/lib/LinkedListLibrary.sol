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


/**
 * @title LinkedListLibrary
 * @author Set Protocol
 *
 * Library for creating and altering uni-directional circularly linked lists, optimized for sequential updating
 */
contract LinkedListLibrary {

    using SafeMath for uint256;

    /* ============ Structs ============ */

    struct LinkedList{
        uint256 dataSizeLimit;
        uint256 lastUpdatedIndex;
        uint256[] dataArray;
    }

    /*
     * Initialize LinkedList by setting limit on amount of nodes and inital value of node 0
     *
     * @param  _self                        LinkedList to operate on 
     * @param  _dataSizeLimit               Max amount of nodes allowed in LinkedList
     * @param  _initialValue                Initial value of node 0 in LinkedList
     */
    function initialize(
        LinkedList storage _self,
        uint256 _dataSizeLimit,
        uint256 _initialValue
    )
        internal
    {
        require(
            _self.dataArray.length == 0,
            "LinkedListLibrary: Initialized LinkedList must be empty"
        );

        // Initialize Linked list by defining upper limit of data points in the list and setting
        // initial value
        _self.dataSizeLimit = _dataSizeLimit;
        _self.dataArray.push(_initialValue);
        _self.lastUpdatedIndex = 0;
    }

    /*
     * Add new value to list by either creating new node if node limit not reached or updating
     * existing node value
     *
     * @param  _self                        LinkedList to operate on 
     * @param  _addedValue                  Value to add to list
     */
    function editList(
        LinkedList storage _self,
        uint256 _addedValue        
    )
        internal
    {
        // Add node if data hasn't reached size limit, otherwise update next node
        _self.dataArray.length < _self.dataSizeLimit ? addNode(_self, _addedValue)
            : updateNode(_self, _addedValue);

    }

    /*
     * Add new value to list by either creating new node. Node limit must not be reached.
     *
     * @param  _self                        LinkedList to operate on 
     * @param  _addedValue                  Value to add to list
     */
    function addNode(
        LinkedList storage _self,
        uint256 _addedValue
    )
        internal
    {
        uint256 newNodeIndex = _self.lastUpdatedIndex.add(1);

        require(
            newNodeIndex == _self.dataArray.length,
            "LinkedListLibrary: Node must be added at next expected index in list"
        );

        require(
            newNodeIndex < _self.dataSizeLimit,
            "LinkedListLibrary: Attempting to add node that exceeds data size limit"
        );

        // Add node value
        _self.dataArray.push(_addedValue);

        // Update lastUpdatedIndex value
        _self.lastUpdatedIndex = newNodeIndex;
    }

    /*
     * Add new value to list by updating existing node. Updates only happen if node limit has been
     * reached.
     *
     * @param  _self                        LinkedList to operate on 
     * @param  _addedValue                  Value to add to list
     */
    function updateNode(
        LinkedList storage _self,
        uint256 _addedValue
    )
        internal
    {
        // Determine the next node in list to be updated
        uint256 updateNodeIndex = _self.lastUpdatedIndex.add(1) % _self.dataSizeLimit;

        // Require that updated node has been previously added
        require(
            updateNodeIndex < _self.dataArray.length,
            "LinkedListLibrary: Attempting to update non-existent node"
        );

        // Update node value and last updated index
        _self.dataArray[updateNodeIndex] = _addedValue;
        _self.lastUpdatedIndex = updateNodeIndex;
    }

    /*
     * Read list from the lastUpdatedIndex back the passed amount of data points.
     *
     * @param  _self                        LinkedList to operate on 
     * @param  _dataPoints                  Number of data points to return
     */
    function readList(
        LinkedList storage _self,
        uint256 _dataPoints
    )
        internal
        view
        returns (uint256[] memory)
    {
        // Make sure query isn't for more data than collected
        require(
            _dataPoints <= _self.dataArray.length,
            "LinkedListLibrary: Querying more data than available"
        );

        // Instantiate output array in memory
        uint256[] memory outputArray = new uint256[](_dataPoints);

        // Find head of list
        uint256 linkedListIndex = _self.lastUpdatedIndex;
        for (uint256 i = 0; i < _dataPoints; i++) {
            // Get value at index in linkedList
            outputArray[i] = _self.dataArray[linkedListIndex];

            // Find next linked index
            linkedListIndex = linkedListIndex == 0 ? _self.dataSizeLimit.sub(1) : linkedListIndex.sub(1);
        }

        return outputArray;
    }
}
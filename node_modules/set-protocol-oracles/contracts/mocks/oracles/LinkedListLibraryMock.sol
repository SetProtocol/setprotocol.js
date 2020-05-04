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

import { LinkedListLibrary } from "../../meta-oracles/lib/LinkedListLibrary.sol";

/**
 * @title LinkedListLibraryMock
 * @author Set Protocol
 *
 * Mock contract for interacting with LinkedListLibrary
 */
contract LinkedListLibraryMock is
    LinkedListLibrary
{
    /* ============ State Variables ============ */

    LinkedListLibrary.LinkedList private linkedList;

    /* ============ Public Function ============ */

    function initializeMock(
        uint256 _dataSizeLimit,
        uint256 _initialValue
    )
        external
    {
        initialize(
            linkedList,
            _dataSizeLimit,
            _initialValue
        );
    }

    function editListMock(
        uint256 _addedValue
    )
        external
    {
        editList(
            linkedList,
            _addedValue
        );
    }

    function addNodeMock(
        uint256 _addedValue
    )
        external
    {
        addNode(
            linkedList,
            _addedValue
        );
    }

    function updateNodeMock(
        uint256 _addedValue
    )
        external
    {
        updateNode(
            linkedList,
            _addedValue
        );
    }

    function readListMock(
        uint256 _dataPoints
    )
        external
        returns (uint256[] memory)
    {
        return readList(
            linkedList,
            _dataPoints
        );
    }

    function addBadValue(
        uint256 _badValue
    )
        external
    {
        linkedList.dataArray.push(_badValue);
    }

    /* ============ Getters ============ */

    function getDataSizeLimit()
        external
        view
        returns (uint256)
    {
        return linkedList.dataSizeLimit;
    }

    function getLastUpdatedIndex()
        external
        view
        returns (uint256)
    {
        return linkedList.lastUpdatedIndex;
    }

    function getDataArray()
        external
        view
        returns (uint256[] memory)
    {
        return linkedList.dataArray;
    }
}
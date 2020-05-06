/*
    Copyright 2020 Set Labs Inc.

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


library BoundsLibrary {
    /* ============ Structs ============ */
    struct Bounds {
        uint256 min;
        uint256 max;
    }

    /* ============ Functions ============ */
    function isValid(Bounds memory _bounds) internal pure returns(bool) {
        return _bounds.max > _bounds.min;
    }

    function isWithin(Bounds memory _bounds, uint256 _value) internal pure returns(bool) {
        return _value > _bounds.max ? false : _value >= _bounds.min;
    }

    function isOutside(Bounds memory _bounds, uint256 _value) internal pure returns(bool) {
        return !isWithin(_bounds, _value);
    }
}

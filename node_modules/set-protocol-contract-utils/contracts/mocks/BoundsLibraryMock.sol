pragma solidity 0.5.7;
pragma experimental "ABIEncoderV2";

import { BoundsLibrary } from "../lib/BoundsLibrary.sol";


contract BoundsLibraryMock {
    using BoundsLibrary for BoundsLibrary.Bounds;

    BoundsLibrary.Bounds public bounds;

    constructor(uint256 _min, uint256 _max)
        public
    {
        bounds.min = _min;
        bounds.max = _max;
    }

    function testIsValid(BoundsLibrary.Bounds calldata _bounds) external pure {
        require(_bounds.isValid(), "Not a valid bound struct");
    }

    function testIsWithin(uint256 _value) external view returns (bool) {
        return bounds.isWithin(_value);
    }

    function testIsOutside(uint256 _value) external view returns (bool) {
        return bounds.isOutside(_value);
    }
}
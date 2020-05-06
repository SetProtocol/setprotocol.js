pragma solidity 0.5.7;

import { ScaleValidations } from "../lib/ScaleValidations.sol";


contract ScaleValidationsMock {
    function validateLessThanEqualOneHundredPercent(uint256 _value)
        external
        view
    {
        ScaleValidations.validateLessThanEqualOneHundredPercent(_value);
    }

    function validateMultipleOfBasisPoint(uint256 _value)
        external
        view
    {
        ScaleValidations.validateMultipleOfBasisPoint(_value);
    }
}
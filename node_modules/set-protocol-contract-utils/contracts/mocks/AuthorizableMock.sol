pragma solidity 0.5.7;

import { Authorizable } from "../lib/Authorizable.sol";


// Mock contract implementation of TimeLockUpgradeV2 functions
contract AuthorizableMock is
    Authorizable
{
    uint256 public testUint;

    constructor()
        public
    {
        authorized[msg.sender] = true;
        authorities.push(msg.sender);
    }

    function testAuthorizable(
        uint256 _testUint
    )
        external
        onlyAuthorized
    {
        testUint = _testUint;
    }
}
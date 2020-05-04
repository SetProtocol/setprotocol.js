pragma solidity 0.5.7;


import { StandardTokenMock } from "./StandardTokenMock.sol";


contract USDCMock is StandardTokenMock {
  constructor(
    address initialAccount,
    uint256 initialBalance,
    string memory _name,
    string memory _symbol
  )
    public
    StandardTokenMock(
      initialAccount,
      initialBalance,
      _name,
      _symbol,
      6
    )
  {}
}

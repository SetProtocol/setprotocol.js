pragma solidity 0.5.7;

contract ChainlinkAggregatorMock {
  int256 public latestAnswer;
  uint256 public latestTimestamp;

  constructor(int256 _latestAnswer) public {
    setLatestAnswer(_latestAnswer);
  }

  function setLatestAnswer(int256 _latestAnswer) public {
    latestAnswer = _latestAnswer;
    latestTimestamp = now;
  }
}
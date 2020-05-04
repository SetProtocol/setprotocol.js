pragma solidity 0.5.7;

import { IMedian } from "../external/DappHub/interfaces/IMedian.sol";

// Mock contract implementation of PriceFeed functions
contract PriceFeedMock {
    address public priceFeed;

    constructor(
        address _priceFeed
    )
        public
    {
        priceFeed = _priceFeed;
    }

    function read()
        external
        view
        returns (uint256)
    {
        IMedian source = IMedian(priceFeed);
        return uint256(source.read());
    }
}

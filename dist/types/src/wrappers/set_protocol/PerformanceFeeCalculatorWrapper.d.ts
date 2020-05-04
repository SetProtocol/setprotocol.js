import Web3 from 'web3';
import { Address } from '../../types/common';
import { BigNumber } from '../../util';
/**
 * @title  PerformanceFeeCalculatorWrapper
 * @author Set Protocol
 *
 * The PerformanceFeeCalculatorWrapper handles all functions on the Protocol Viewer smart contract.
 *
 */
export declare class PerformanceFeeCalculatorWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Fetches maximumProfitFeePercentage of PerformanceFeeCalculator.
     *
     * @param  performanceFeeCalculatorAddress     Address of the PerformanceFeeCalculator contract
     */
    maximumProfitFeePercentage(performanceFeeCalculatorAddress: Address): Promise<BigNumber>;
    /**
     * Fetches maximumProfitFeePercentage of PerformanceFeeCalculator.
     *
     * @param  performanceFeeCalculatorAddress     Address of the PerformanceFeeCalculator contract
     */
    maximumStreamingFeePercentage(performanceFeeCalculatorAddress: Address): Promise<BigNumber>;
}

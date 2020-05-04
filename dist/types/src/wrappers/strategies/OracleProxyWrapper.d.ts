import Web3 from 'web3';
import { BigNumber } from '../../util';
import { Address } from '../../types/common';
/**
 * @title  OracleProxyWrapper
 * @author Set Protocol
 *
 * Wrapper for interacting with OraclProxy functions
 *
 */
export declare class OracleProxyWrapper {
    private web3;
    private contracts;
    constructor(web3: Web3);
    /**
     * Get the oracle the OracleProxy is currently getting prices from
     *
     * @param  oracleProxyAddress           Address of the rebalancing manager contract
     * @return                              Address supplying prices to OracleProxy
     */
    oracleInstance(oracleProxyAddress: Address): Promise<Address>;
    /**
     * Get the current price from the OracleProxy
     *
     * @param  oracleProxyAddress           Address of the rebalancing manager contract
     * @return                              Current price given by OracleProxy
     */
    read(oracleProxyAddress: Address): Promise<BigNumber>;
}

import Web3 from 'web3';
import { AuthorizableContract, BTCETHRebalancingManagerContract, CoreContract, ERC20DetailedContract, ExchangeIssuanceModuleContract, KyberNetworkWrapperContract, RebalancingSetExchangeIssuanceModuleContract, RebalanceAuctionModuleContract, RebalancingSetTokenContract, MedianContract, SetTokenContract, TimeLockUpgradeContract, TransferProxyContract, WhiteListContract, VaultContract } from 'set-protocol-contracts';
import { Address } from '../../types/common';
/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export declare class ContractWrapper {
    private web3;
    private cache;
    constructor(web3: Web3);
    /**
     * Load Core contract
     *
     * @param  coreAddress        Address of the Core contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The Core Contract
     */
    loadCoreAsync(coreAddress: Address, transactionOptions?: object): Promise<CoreContract>;
    /**
     * Load Set Token contract
     *
     * @param  setTokenAddress    Address of the Set Token contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The Set Token Contract
     */
    loadSetTokenAsync(setTokenAddress: Address, transactionOptions?: object): Promise<SetTokenContract>;
    /**
     * Load Rebalancing Set Token contract
     *
     * @param  rebalancingSetTokenAddress    Address of the Set Token contract
     * @param  transactionOptions            Options sent into the contract deployed method
     * @return                               The Set Token Contract
     */
    loadRebalancingSetTokenAsync(rebalancingSetTokenAddress: Address, transactionOptions?: object): Promise<RebalancingSetTokenContract>;
    /**
     * Load ERC20 Token contract
     *
     * @param  tokenAddress    Address of the ERC20 Token contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The ERC20 Token Contract
     */
    loadERC20TokenAsync(tokenAddress: Address, transactionOptions?: object): Promise<ERC20DetailedContract>;
    /**
     * Load Vault contract
     *
     * @param  vaultAddress       Address of the Vault contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The Vault Contract
     */
    loadVaultAsync(vaultAddress: Address, transactionOptions?: object): Promise<VaultContract>;
    /**
     * Load TransferProxy contract
     *
     * @param  transferProxyAddress       Address of the TransferProxy contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The TransferProxy Contract
     */
    loadTransferProxyAsync(transferProxyAddress: Address, transactionOptions?: object): Promise<TransferProxyContract>;
    /**
     * Load Rebalance Auction Module contract
     *
     * @param  rebalanceAuctionModuleAddress       Address of the Rebalance Auction Module contract
     * @param  transactionOptions                  Options sent into the contract deployed method
     * @return                                     The Rebalance Auction Module Contract
     */
    loadRebalanceAuctionModuleAsync(rebalanceAuctionModuleAddress: Address, transactionOptions?: object): Promise<RebalanceAuctionModuleContract>;
    /**
     * Load Kyber Network Wrapper contract
     *
     * @param  kyberNetworkWrapperAddress          Address of the Kyber Network Wrapper contract
     * @param  transactionOptions                  Options sent into the contract deployed method
     * @return                                     The Kyber Network Wrapper Contract
     */
    loadKyberNetworkWrapperAsync(kyberNetworkWrapperAddress: Address, transactionOptions?: object): Promise<KyberNetworkWrapperContract>;
    /**
     * Load RebalancingSetExchangeIssuanceModule contract
     *
     * @param  rebalancingSetExchangeIssuanceAddress    Address of the RebalancingSetExchangeIssuanceModule contract
     * @param  transactionOptions                       Options sent into the contract deployed method
     * @return                                          The RebalancingSetExchangeIssuanceModule Contract
     */
    loadRebalancingSetExchangeIssuanceModuleAsync(rebalancingSetExchangeIssuanceAddress: Address, transactionOptions?: object): Promise<RebalancingSetExchangeIssuanceModuleContract>;
    /**
     * Load an Authorizable contract
     *
     * @param  authorizableAddress    Address of the Authorizable contract
     * @param  transactionOptions     Options sent into the contract deployed method
     * @return                        The Authorizable Contract
     */
    loadAuthorizableAsync(authorizableAddress: Address, transactionOptions?: object): Promise<AuthorizableContract>;
    /**
     * Load a TimeLockUpgrade contract
     *
     * @param  timeLockUpgradeAddress Address of the TimeLockUpgrade contract
     * @param  transactionOptions     Options sent into the contract deployed method
     * @return                        The TimeLockUpgrade Contract
     */
    loadTimeLockUpgradeAsync(timeLockUpgradeAddress: Address, transactionOptions?: object): Promise<TimeLockUpgradeContract>;
    /**
     * Load a Whitelist contract
     *
     * @param  whitelistAddress Address of the Whitelist contract
     * @param  transactionOptions     Options sent into the contract deployed method
     * @return                        The Whitelist Contract
     */
    loadWhitelistAsync(whitelistAddress: Address, transactionOptions?: object): Promise<WhiteListContract>;
    /**
     * Load BtcEthManagerContract contract
     *
     * @param  btcEthManagerAddress           Address of the BTCETHRebalancingManagerContract contract
     * @param  transactionOptions             Options sent into the contract deployed method
     * @return                                The BtcEthManagerContract Contract
     */
    loadBtcEthManagerAsync(btcEthManagerAddress: Address, transactionOptions?: object): Promise<BTCETHRebalancingManagerContract>;
    /**
     * Load a ExchangeIssuanceModule contract
     *
     * @param  exchangeIssuanceModule                Address of the ExchangeIssuanceModule contract
     * @param  transactionOptions                    Options sent into the contract deployed method
     * @return                                       The ExchangeIssuanceModule Contract
     */
    loadExchangeIssuanceModuleAsync(exchangeIssuanceModule: Address, transactionOptions?: object): Promise<ExchangeIssuanceModuleContract>;
    /**
     * Load a Medianizer contract
     *
     * @param  medianizer                   Address of the Medianizer contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The Medianizer Contract
     */
    loadMedianizerContract(medianizer: Address, transactionOptions?: object): Promise<MedianContract>;
}

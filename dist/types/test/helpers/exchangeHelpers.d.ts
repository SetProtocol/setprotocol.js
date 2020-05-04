import Web3 from 'web3';
import { CoreContract, KyberNetworkWrapperContract, TransferProxyContract, ZeroExExchangeWrapperContract } from 'set-protocol-contracts';
export declare const deployZeroExExchangeWrapperContract: (web3: Web3, zeroExExchangeAddress: string, zeroExProxyAddress: string, zeroExTokenAddress: string, transferProxy: TransferProxyContract, core: CoreContract) => Promise<ZeroExExchangeWrapperContract>;
export declare const deployKyberNetworkWrapperContract: (web3: Web3, kyberNetworkProxyAddress: string, transferProxy: TransferProxyContract, core: CoreContract) => Promise<KyberNetworkWrapperContract>;

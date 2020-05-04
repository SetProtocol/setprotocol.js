import Web3 from 'web3';
import { ExchangeIssuanceParams } from 'set-protocol-utils';
import { BigNumber } from '../util';
import { Address, KyberTrade, ZeroExSignedFillOrder } from '../types/common';
export declare class ExchangeAssertions {
    private erc20Assertions;
    private commonAssertions;
    private setTokenAssertions;
    private addressToAddressWhiteList;
    constructor(web3: Web3);
    assertExchangeIssuanceParams(exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], coreAddress: Address, cTokenWhiteListAddress: Address): Promise<void>;
    assertSendTokenInputs(sendTokens: Address[], sendTokenExchangeIds: BigNumber[], sendTokenAmounts: BigNumber[], coreAddress: Address): void;
    assertReceiveTokenInputs(receiveTokens: Address[], receiveTokenAmounts: BigNumber[], setAddress: Address): void;
    assertExchangeIssuanceOrdersValidity(exchangeIssuanceParams: ExchangeIssuanceParams, orders: (KyberTrade | ZeroExSignedFillOrder)[], cTokenWhiteListAddress: Address): Promise<void>;
    private isValidLiquidityAmounts;
    private calculateLiquidityFills;
    private addLiquidityOrderContribution;
    private isValidKyberTradeFill;
    private isValidZeroExOrderFill;
}

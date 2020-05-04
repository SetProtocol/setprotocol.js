import Web3 from 'web3';
import { AccountAssertions } from './AccountAssertions';
import { CommonAssertions } from './CommonAssertions';
import { CoreAssertions } from './CoreAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { ExchangeAssertions } from './ExchangeAssertions';
import { IssuanceAssertions } from './IssuanceAssertions';
import { RebalancingAssertions } from './RebalancingAssertions';
import { SchemaAssertions } from './SchemaAssertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { SocialTradingAssertions } from './SocialTradingAssertions';
import { VaultAssertions } from './VaultAssertions';
export declare class Assertions {
    account: AccountAssertions;
    common: CommonAssertions;
    core: CoreAssertions;
    erc20: ERC20Assertions;
    exchange: ExchangeAssertions;
    issuance: IssuanceAssertions;
    rebalancing: RebalancingAssertions;
    schema: SchemaAssertions;
    setToken: SetTokenAssertions;
    socialTrading: SocialTradingAssertions;
    vault: VaultAssertions;
    constructor(web3: Web3);
}

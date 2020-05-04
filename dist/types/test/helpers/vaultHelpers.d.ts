import { VaultContract } from 'set-protocol-contracts';
import { BigNumber } from '@src/util';
export declare const getVaultBalances: (vault: VaultContract, tokenAddresses: string[], owner: string) => Promise<BigNumber[]>;

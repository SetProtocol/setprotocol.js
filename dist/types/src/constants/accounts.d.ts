import { Address } from 'set-protocol-utils';
export interface Account {
    address: Address;
    privateKey: string;
}
declare const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
declare const ACCOUNTS: Account[];
declare const DEFAULT_ACCOUNT: string;
export { ACCOUNTS, DEFAULT_ACCOUNT, NULL_ADDRESS };

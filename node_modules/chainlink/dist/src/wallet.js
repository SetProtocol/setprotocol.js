"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const debug_1 = require("./debug");
/**
 * Create a pre-funded wallet with all defaults
 *
 * @param provider The provider to connect to the created wallet and to withdraw funds from
 * @param accountIndex The account index of the corresponding wallet derivation path
 */
async function createFundedWallet(provider, accountIndex) {
    const wallet = createWallet(provider, accountIndex);
    const receipt = await fundWallet(wallet, provider);
    return { wallet, receipt };
}
exports.createFundedWallet = createFundedWallet;
/**
 * Create an ethers.js wallet instance that is connected to the given provider
 *
 * @param provider A compatible ethers.js provider such as the one returned by `ganache.provider()` to connect the wallet to
 * @param accountIndex The account index to derive from the mnemonic phrase
 */
function createWallet(provider, accountIndex) {
    const debug = debug_1.makeDebug('wallet:createWallet');
    if (accountIndex < 0) {
        throw Error(`Account index must be greater than 0, got ${accountIndex}`);
    }
    /**
     * THIS IS FOR TESTING PURPOSES ONLY
     */
    const mnemonicPhrase = 'dose weasel clever culture letter volume endorse used harvest ripple circle install';
    const path = `m/44'/60'/${accountIndex}'/0/0`;
    debug('created wallet with parameters: %o', { mnemonicPhrase, path });
    return ethers_1.ethers.Wallet.fromMnemonic(mnemonicPhrase, path).connect(provider);
}
exports.createWallet = createWallet;
/**
 * Fund a wallet with unlocked accounts available from the given provider
 *
 * @param wallet The ethers wallet to fund
 * @param provider The provider which has control over unlocked, funded accounts to transfer funds from
 * @param overrides Transaction parameters to override when sending the funding transaction
 */
async function fundWallet(wallet, provider, overrides) {
    const debug = debug_1.makeDebug('wallet:fundWallet');
    debug('funding wallet');
    debug('retreiving accounts...');
    const nodeOwnedAccounts = await provider.listAccounts();
    debug('retreived accounts: %o', nodeOwnedAccounts);
    const signer = provider.getSigner(nodeOwnedAccounts[0]);
    const txParams = {
        to: wallet.address,
        value: ethers_1.ethers.utils.parseEther('10'),
        ...overrides,
    };
    debug('sending tx with the following parameters: %o', txParams);
    const tx = await signer.sendTransaction(txParams);
    debug('waiting on tx %s to complete...', tx.hash);
    const receipt = await tx.wait();
    debug('tx %s confirmed with tx receipt %o', tx.hash, receipt);
    return receipt;
}
exports.fundWallet = fundWallet;
//# sourceMappingURL=wallet.js.map
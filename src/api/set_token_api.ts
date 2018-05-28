import * as Web3 from "web3";
import * as _ from "lodash";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token, Component, TransactionOpts } from "../types/common";

import { Assertions } from "../invariants";
import { estimateIssueRedeemGasCost } from "../util/set_token_utils";
import { SetTokenContract, ERC20Contract as ERC20 } from "../wrappers";

// APIs
import { ContractsAPI } from ".";

export const SetTokenAPIErrors = {
  QUANTITY_NEEDS_TO_BE_NON_ZERO: (quantity: BigNumber) =>
    `The quantity ${quantity.toString()} inputted needs to be non-zero`,
};

const DEFAULT_GAS_PRICE: BigNumber = new BigNumber(6000000000); // 6 gwei

export class SetTokenAPI {
  private provider: Web3;
  private assert: Assertions;
  private contracts: ContractsAPI;

  constructor(web3: Web3, contracts: ContractsAPI) {
    this.provider = web3;
    this.contracts = contracts;
    this.assert = new Assertions(this.provider);
  }

  /**
   * Asynchronously retrieve a Set's components
   *
   * @param  setAddress Address the address of the Set
   * @return            a promise with the list of Components, an object with the address and unit
   */
  public async getComponents(setAddress: Address): Promise<Component[]> {
    this.assert.schema.isValidAddress("setAddress", setAddress);

    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    const componentAddresses = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const components: Component[] = [];

    _.each(componentAddresses, (componentAddress, index) => {
      const newComponent = {
        address: componentAddress,
        unit: units[index],
      };
      components.push(newComponent);
    });

    return components;
  }

  /**
   *  Retrieves the natural Unit for the Set
   *
   *  @param  setAddress the address of the Set
   *  @return            a promise with the Natural Unit
   */
  public async getNaturalUnit(setAddress: Address): Promise<BigNumber> {
    this.assert.schema.isValidAddress("setAddress", setAddress);
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();
    return naturalUnit;
  }

  /**
   *  Asynchronously issues a particular quantity of tokens from a particular Sets
   *
   *  @param  setAddress Address the address of the Set
   *  @param  quantityInWei The amount in Wei; This should be a multiple of the natural Unit
   *  @param  userAddress The user address
   *  @param  txOpts The options for executing the transaction
   */
  public async issueSetAsync(
    setAddress: Address,
    quantityInWei: BigNumber,
    userAddress: Address,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("setAddress", setAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.schema.isValidNumber("quantityInWei", quantityInWei);

    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress, {
      from: userAddress,
    });

    await this.assert.common.greaterThanZero(
      quantityInWei,
      SetTokenAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(quantityInWei),
    );
    await this.assert.setToken.isMultipleOfNaturalUnit(setTokenInstance, quantityInWei);
    await this.assert.setToken.hasSufficientBalances(setTokenInstance, quantityInWei, userAddress);
    await this.assert.setToken.hasSufficientAllowances(
      setTokenInstance,
      quantityInWei,
      userAddress,
    );

    const componentAddresses = await setTokenInstance.getComponents.callAsync();
    const numComponents = new BigNumber(componentAddresses.length);

    const gasEstimate = estimateIssueRedeemGasCost(numComponents);

    const txSettings = Object.assign({ gas: gasEstimate, gasPrice: DEFAULT_GAS_PRICE }, txOpts);
    const txHash = setTokenInstance.issue.sendTransactionAsync(quantityInWei, {
      from: userAddress,
      gas: txSettings.gas,
      gasPrice: txSettings.gasPrice,
    });

    return txHash;
  }

  /**
   *  Asynchronously redeems a particular quantity of tokens from a particular Sets
   *
   *  @param  setAddress Address the address of the Set
   *  @param  quantityInWei The amount in Wei; This should be a multiple of the natural Unit
   *  @param  userAddress The user address
   *  @param  txOpts The options for executing the transaction
   */
  public async redeemSetAsync(
    setAddress: Address,
    quantityInWei: BigNumber,
    userAddress: Address,
    txOpts?: TransactionOpts,
  ): Promise<string> {
    this.assert.schema.isValidAddress("setAddress", setAddress);
    this.assert.schema.isValidAddress("userAddress", userAddress);
    this.assert.schema.isValidNumber("quantityInWei", quantityInWei);

    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress, {
      from: userAddress,
    });

    await this.assert.common.greaterThanZero(
      quantityInWei,
      SetTokenAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(quantityInWei),
    );
    await this.assert.setToken.isMultipleOfNaturalUnit(setTokenInstance, quantityInWei);
    await this.assert.erc20.hasSufficientBalance(
      setTokenInstance,
      userAddress,
      quantityInWei,
      "Insufficient Balance",
    );

    const componentAddresses = await setTokenInstance.getComponents.callAsync();
    const numComponents = new BigNumber(componentAddresses.length);
    const gasEstimate = estimateIssueRedeemGasCost(numComponents);

    const txSettings = Object.assign({ gas: gasEstimate, gasPrice: DEFAULT_GAS_PRICE }, txOpts);
    const txHash = setTokenInstance.redeem.sendTransactionAsync(quantityInWei, {
      from: userAddress,
      gas: txSettings.gas,
      gasPrice: txSettings.gasPrice,
    });

    return txHash;
  }
}

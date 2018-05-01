import * as Web3 from "web3";
import * as _ from "lodash";
import { BigNumber } from "../util/bignumber";
import { Address, UInt, Token } from "../types/common";

import { Assertions } from "../invariants";
import {
  SetTokenContract,
  ERC20Contract as ERC20,
} from "../wrappers";

// APIs
import { ContractsAPI } from ".";

export const SetTokenAPIErrors = {
  QUANTITY_NEEDS_TO_BE_NON_ZERO: (quantity: BigNumber) =>
    `The quantity ${quantity.toString()} inputted needs to be non-zero`,
};

interface Component {
  address: Address;
  unit: BigNumber;
}

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
   *  Retrieves the components and delivers their unit and addresses
   */
  public async getComponents(setAddress: Address): Promise<Component[]> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    const componentAddresses = await setTokenInstance.getComponents.callAsync();
    const units = await setTokenInstance.getUnits.callAsync();
    const components: Component[] = [];

    _.each(componentAddresses, (componentAddress, index) => {
      const newComponent = {
        address: componentAddress,
        unit: units[index],
      }
      components.push(newComponent);
    });

    return components;
  }

  /**
   *  Retrieves the natural Unit for the {Set}
   */
  public async getNaturalUnit(setAddress: Address): Promise<BigNumber> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress);
    const naturalUnit = await setTokenInstance.naturalUnit.callAsync();
    return naturalUnit;
  }

  /**
   *  Issues a particular quantity of tokens from a particular {Set}s
   */
  public async issueSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress, { from: userAddress });

    await this.assert.common.greaterThanZero(
      quantityInWei,
      SetTokenAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(quantityInWei)
    );
    await this.assert.setToken.isMultipleOfNaturalUnit(setTokenInstance, quantityInWei);
    await this.assert.setToken.hasSufficientBalances(setTokenInstance, quantityInWei, userAddress);
    await this.assert.setToken.hasSufficientAllowances(setTokenInstance, quantityInWei, userAddress);

    const txHash = setTokenInstance.issue.sendTransactionAsync(
      quantityInWei,
      { from: userAddress }
    );

    return txHash;
  }

  /**
   *  Redeems a particular quantity of tokens from a particular {Set}s
   */
  public async redeemSetAsync(setAddress: Address, quantityInWei: BigNumber, userAddress: Address): Promise<string> {
    const setTokenInstance = await this.contracts.loadSetTokenAsync(setAddress, { from: userAddress });

    await this.assert.common.greaterThanZero(
      quantityInWei,
      SetTokenAPIErrors.QUANTITY_NEEDS_TO_BE_NON_ZERO(quantityInWei)
    );
    await this.assert.setToken.isMultipleOfNaturalUnit(setTokenInstance, quantityInWei);
    await this.assert.setToken.hasSufficientBalances(setTokenInstance, quantityInWei, userAddress);
    await this.assert.setToken.hasSufficientAllowances(setTokenInstance, quantityInWei, userAddress);

    const txHash = setTokenInstance.redeem.sendTransactionAsync(quantityInWei, { from: userAddress });

    return txHash;
  }
}
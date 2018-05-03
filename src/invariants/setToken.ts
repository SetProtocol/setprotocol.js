import * as _ from "lodash";
import * as Web3 from "web3";

import { Address, UInt } from "../types/common";
import { BigNumber } from "../util/bignumber";
import { SetTokenContract } from "../wrappers/SetToken_wrapper";
import { DetailedERC20Contract as ERC20 } from "../wrappers/DetailedERC20_wrapper";

import { ERC20Assertions } from "./erc20";
const erc20Assert = new ERC20Assertions();

export const TokenAssertionErrors = {
  QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT: (setAddress: string, quantity: BigNumber, naturalUnit: BigNumber) =>
    `Quantity ${quantity.toString()} for token at address (${setAddress}) is not a multiple of natural unit (${naturalUnit.toString()}).`,
  MISSING_SET_METHOD: (address: string) =>
    `Contract at ${address} does not implement SET.`,
};

export class SetTokenAssertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  public async implementsSet(setInstance: SetTokenContract): Promise<void> {
    const { address } = setInstance;

    try {
      await setInstance.naturalUnit.callAsync();
    } catch (error) {
      throw new Error(TokenAssertionErrors.MISSING_SET_METHOD(address));
    }
  }

  public async isMultipleOfNaturalUnit(
    setToken: SetTokenContract,
    quantityInWei: BigNumber,
  ): Promise<void> {

    const naturalUnit = await setToken.naturalUnit.callAsync();

    if (!quantityInWei.mod(naturalUnit).eq(new BigNumber(0))) {
      throw new Error(TokenAssertionErrors.QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT(
        setToken.address,
        quantityInWei,
        naturalUnit
      ));
    }
  }

  public async hasSufficientBalances(
    setToken: SetTokenContract,
    quantityInWei: BigNumber,
    payer: Address,
  ): Promise<void> {
    const components = await setToken.getComponents.callAsync();
    const units = await setToken.getUnits.callAsync();
    const naturalUnit = await setToken.naturalUnit.callAsync();

    const componentInstancePromises = _.map(components, (component) => {
      return ERC20.at(component, this.web3, { from: payer });
    });

    const componentInstances = await Promise.all(componentInstancePromises);

    const userHasSufficientBalancePromises = _.map(componentInstances, (componentInstance, index) => {
      const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
      return erc20Assert.hasSufficientBalance(
        componentInstance,
        payer,
        requiredBalance,
        `User does not have enough balance of token at address ${componentInstance.address}`,
      );
    });

    await Promise.all(userHasSufficientBalancePromises);
  }

  public async hasSufficientAllowances(
    setToken: SetTokenContract,
    quantityInWei: BigNumber,
    payer: Address,
  ): Promise<void> {
    const components = await setToken.getComponents.callAsync();
    const units = await setToken.getUnits.callAsync();
    const naturalUnit = await setToken.naturalUnit.callAsync();

    const componentInstancePromises = _.map(components, (component) => {
      return ERC20.at(component, this.web3, { from: payer });
    });

    const componentInstances = await Promise.all(componentInstancePromises);

    const userHasSufficientAllowancePromises = _.map(componentInstances, (componentInstance, index) => {
      const requiredBalance = units[index].div(naturalUnit).times(quantityInWei);
      return erc20Assert.hasSufficientAllowance(
        componentInstance,
        payer,
        setToken.address,
        requiredBalance,
        `User does not have enough allowance of token at address ${componentInstance.address}`,
      );
    });

    await Promise.all(userHasSufficientAllowancePromises);
  }
}

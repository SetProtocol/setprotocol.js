import * as _ from "lodash";
import * as Web3 from "web3";

import { Address, UInt } from "../types/common";
import { BigNumber } from "../util/bignumber";
import { SetTokenContract } from "../wrappers/SetToken_wrapper";
import { DetailedERC20Contract as ERC20 } from "../wrappers/DetailedERC20_wrapper";

export const TokenAssertionErrors = {
  QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT: (setAddress: string, quantity: BigNumber, naturalUnit: BigNumber) =>
    `Quantity ${quantity.toString()} for token at address (${setAddress}) is not a multiple of natural unit (${naturalUnit.toString()}).`,
};

export class SetTokenAssertions {
  private web3: Web3;

  constructor(web3: Web3) {
    this.web3 = web3;
  }

  public async isMultipleOfNaturalUnit(
    setToken: SetTokenContract,
    quantityInWei: BigNumber,
  ): Promise<void> {
    
    const naturalUnit = await setToken.naturalUnit.callAsync();

    if (quantityInWei.mod(naturalUnit) !== new BigNumber(0)) {
      throw new Error(TokenAssertionErrors.QUANTITY_NOT_MULTIPLE_OF_NATURAL_UNIT(
        setToken.address,
        quantityInWei,
        naturalUnit
      ));
    }
  }

  // TODO: We need to pull in a Web3 provider like dharma does


  // TODO: This function should loop through each component
  // And check if the user has enough balance in the ERC20 token
  // Once you've been able to pull in the TokenInstnace, you can actually use token.ts
  // to check the allowance of each token
  public async hasSufficientBalances(
    setToken: SetTokenContract,
    quantityInWei: BigNumber[],
    payer: Address,
  ): Promise<void> {
    const components = await setToken.getComponents.callAsync();
    const units = await setToken.getUnits.callAsync();

    const componentInstancePromises = _.map(components, (component) => {
      return ERC20.at(component, this.web3, { from: payer });
    });

    const componentInstances = await Promise.all(componentInstancePromises);

    const userComponentBalances = _.map(componentInstances, (componentInstance) => {
      return 
    });

    
  }

  // TODO: This function should loop through each component
  // And check if the user has enough balance in the ERC20 token
  // Once you've been able to pull in the TokenInstnace, you can actually use token.ts
  // to check the allowance of each token
  public async hasSufficientAllowances(
    setToken: SetTokenContract,
    quantityInWei: BigNumber[],
    provider: Web3,
  ): Promise<void> {

  }
}

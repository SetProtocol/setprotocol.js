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

  public async hasSufficientBalances(
    setToken: SetTokenContract,
    quantityInWei: BigNumber[],
    provider: Web3,
  ): Promise<void> {
    
    

    
  }
}

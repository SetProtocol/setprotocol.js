import { BigNumber } from "../util/bignumber";
import { CoreContract as Core } from "../wrappers/core_wrapper";

export const CoreAssertionErrors = {
  MISSING_CORE_METHOD: (address: string) =>
    `Contract at ${address} does not implement Core interface.`,
};

export class CoreAssertions {
  // Throws if the given candidateContract does not respond to some methods from the Core interface.
  public async implementsCore(coreInstance: Core): Promise<void> {
    const { address } = coreInstance;

    try {
      await coreInstance.vaultAddress.callAsync();
      await coreInstance.transferProxyAddress.callAsync();
      await coreInstance.owner.callAsync();
    } catch (error) {
      throw new Error(CoreAssertionErrors.MISSING_CORE_METHOD(address));
    }
  }
}

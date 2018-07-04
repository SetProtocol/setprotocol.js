import { NULL_ADDRESS } from "../util/constants";

export class AccountAssertions {
  public notNull(account: string, errorMessage: string) {
    if (account === NULL_ADDRESS) {
      throw new Error(errorMessage);
    }
  }
}

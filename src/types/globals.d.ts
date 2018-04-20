import { BigNumber } from "bigNumber.js";

declare module "web3.js";
declare module "*.json" {
  const json: any;
  /* tslint:disable */
  export default json;
  /* tslint:enable */
}

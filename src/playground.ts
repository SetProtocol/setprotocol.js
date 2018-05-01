import * as Web3 from "web3";
import { BigNumber } from "./util/bignumber";

import SetProtocol from "./index";

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const setProtocol = new SetProtocol(web3);

// Get balance of a token

const OWNER = "0xda7a234c4f05a260f8567962789936982fec62e0";

const TRUEUSDAddress = "0xafbc3ff59c37ee69228db07467ac89c1c3263406";
const DAIAddress = "0x9c1f89607cc49a7dae04b93121ddd758daa1eaa6";
const StableSetAddress = "0x6137c6e7358baf51325f68a47690e3dda2c98ef6";

const doStuff = async () => {
  const trustTokenName = await setProtocol.erc20.getTokenName(TRUEUSDAddress);
  const ownerBalanceOfTrustToken: BigNumber = await setProtocol.erc20.getUserBalance(TRUEUSDAddress, OWNER);
  console.log("Token Name", trustTokenName, " ", ownerBalanceOfTrustToken.toString(10));

  const daiName = await setProtocol.erc20.getTokenName(DAIAddress);
  const ownerBalanceOfDai: BigNumber = await setProtocol.erc20.getUserBalance(DAIAddress, OWNER);
  console.log("Token Name", daiName, " ", ownerBalanceOfDai.toString(10));


  const stableSetSupply: BigNumber = await setProtocol.erc20.getTotalSupply(StableSetAddress);
  console.log("StableSetSupply", stableSetSupply.toString(10));

  const stableSetNaturalUnit: BigNumber = await setProtocol.setToken.getNaturalUnit(StableSetAddress);
  console.log("Natural Unit", stableSetNaturalUnit.toString(10));

  await setProtocol.erc20.setUnlimitedAllowanceAsync(TRUEUSDAddress, StableSetAddress, OWNER);
  await setProtocol.erc20.setUnlimitedAllowanceAsync(DAIAddress, StableSetAddress, OWNER);



  // Try issuing
  await setProtocol.setToken.issueSetAsync(StableSetAddress, new BigNumber(10**9), OWNER);

  const components = await setProtocol.setToken.getComponents(StableSetAddress);

  console.log('Components', components);

}

doStuff();
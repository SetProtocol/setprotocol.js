import * as Web3 from "web3";
import { BigNumber } from "./util/bignumber";

import SetProtocol from "./index";

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const setProtocol = new SetProtocol(web3);

// Get balance of a token

const OWNER = "0xe990b05e630419e187149f1a54b8e1b2a7228bdd";

const TRUEUSDAddress = "0x300f50041b11399dcef3def46ba5fbef2bbc2f6d";
const DAIAddress = "0x6553fbe47fb7fee6cd340ed8d836a83be9531489";
const StableSetAddress = "0xf397f328ae90c6a60c7000cbb0ea9e8b632c6a0b";

const DEXSetAddress = "0x5cf69da0d1d4554d8e3b3900debf2e0cc7099fbb";
const ETH10SetAddress = "0x2b56b97d1949ca7b9ce13df645689267308751d4";

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
  await setProtocol.setToken.issueSetAsync(StableSetAddress, new BigNumber(10 ** 9), OWNER);

  const stableSetcomponents = await setProtocol.setToken.getComponents(StableSetAddress);
  console.log("Stable Set Components", stableSetcomponents);

  const Eth10components = await setProtocol.setToken.getComponents(ETH10SetAddress);
  console.log("ETH10 Set");
  Eth10components.forEach((component) => {
    console.log(`${component.address} is ${component.unit.toString(10)} units`);
  });

};

doStuff();

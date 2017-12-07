const SetProtocol = require('../dist/SetProtocol.js').default;
const HDWalletProvider = require("truffle-hdwallet-provider");

// Set Registry
const SET_REGISTRY_ADDRESS = "0x8f72b728855b3c64269774415a24c18b678d056d"
const provider = new HDWalletProvider("MENOMIC", "https://ropsten.infura.io/CVc0eIBfa6DnZV3cW3n7");
const setProtocol = new SetProtocol(provider, "0xa415bcfd9d8b70dafee7d53cddb636e1395683c7");

async function doStuff() {
  const sets = await setProtocol.updateSetRegistryAddress(SET_REGISTRY_ADDRESS).then(
    () => setProtocol.getSetsFromRegistryAsync());
  console.log(sets);
}

doStuff();

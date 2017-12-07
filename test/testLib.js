const SetProtocol = require('../dist/SetProtocol.js').default;
const HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "laundry catch blur fence junior spoil margin tornado bridge debris excess crash";

// Set Registry
const SET_REGISTRY_ADDRESS = "0x8f72b728855b3c64269774415a24c18b678d056d"
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/CVc0eIBfa6DnZV3cW3n7");
const setProtocol = new SetProtocol(provider, "0xa415bcfd9d8b70dafee7d53cddb636e1395683c7");

async function doStuff() {
  const testUserAddress = '0x69Bdb276A17Dd90F9D3A545944CCB20E593ae8E3';
  const testSetAddress1 = '0xfd0e68e60f7a217951ea8530afc88825a3480a18';
  const testSetAddress2 = '0x4c1a4a506e9c643bfff6d36fb4e2f86794a63536';
  const setAddresses = [testSetAddress1, testSetAddress1];

  const events = await setProtocol.updateSetRegistryAddress(SET_REGISTRY_ADDRESS).then(
    () => setProtocol.getSetLogsForMultipleSetsUserAsync(setAddresses, testUserAddress));
  console.log('Final result', events);
}

doStuff();

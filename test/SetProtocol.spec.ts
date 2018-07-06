/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

import * as chai from "chai";
import * as Web3 from "web3";

import SetProtocol from '../src';
import { CoreContract } from "../src/wrappers";

import { ACCOUNTS } from "./accounts";

const provider = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(provider);
const { expect } = chai;

const TX_DEFAULTS = { from: ACCOUNTS[0].address, gas: 4712388 };

describe('SetProtocol', async () => {
  const coreContract = await CoreContract.deployed(web3, TX_DEFAULTS);
  const setProtocolInstance = new SetProtocol(web3, coreContract.address);
  it('should instantiate a new setProtocolInstance', () => {
    expect(setProtocolInstance instanceof SetProtocol);
  });
});

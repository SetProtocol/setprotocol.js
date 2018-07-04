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

const provider = new Web3.providers.HttpProvider("http://localhost:8545");

const { expect } = chai;

// SetProtocol.test.ts
describe(`SetProtocol`, () => {
  const setProtocolInstance = new SetProtocol(provider);
  it(`should instantiate a new setProtocolInstance`, () => {
    expect(setProtocolInstance instanceof SetProtocol);
  });

  it(`should set a provider in setProtocolInstance`, () => {
    expect(setProtocolInstance.provider).to.exist;
  });
});

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

export const addressSchema = {
  id: '/Address',
  type: 'string',
  pattern: '^0x[0-9a-fA-F]{40}$',
};

export const bytes32Schema = {
  id: '/Bytes32',
  type: 'string',
  pattern: '^0x[0-9a-fA-F]{64}$',
};

export const bytesSchema = {
  id: '/Bytes',
  type: 'string',
  pattern: '^0x[0-9a-fA-F]*$',
};

export const numberSchema = {
  id: '/Number',
  type: 'object',
  // Ensures that the object meets the validator.customFormats.BigNumber format.
  format: 'BigNumber',
};

export const wholeNumberSchema = {
  id: '/WholeNumber',
  type: 'object',
  format: 'wholeBigNumber',
};

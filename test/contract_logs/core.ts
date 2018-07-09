import { Log, Address, CreateLogArgs } from "../../src/types/common";

export function extractNewSetTokenAddressFromLogs(logs: Log[]): Address {
  const createLog = logs[logs.length - 1];
  const args: CreateLogArgs = createLog.args;
  return args._setTokenAddress;
}

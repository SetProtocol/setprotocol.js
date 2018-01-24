import * as Web3 from 'web3';

export const Utils = {
  getLogsAsync: function (events: AllEventsResult) {
    return new Promise(function (resolve, reject) {
      events.get((err: Error, logs: LogEntry[]) => {
        if (err) { reject(err) };
        resolve(logs);
      });
    });
  }
};

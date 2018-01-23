import * as Web3 from 'web3';

export const Utils = {
  getLogsAsync: function (events: AllEventsResult) {
    return new Promise(function (resolve, reject) {
      events.get((err: string, logs: Event[]) => {
        if (err) { reject(err) };
        resolve(logs);
      });
    });
  }
};

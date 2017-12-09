var Utils = {
  getLogsAsync: function (events) {
    return new Promise(function (resolve, reject) {
      events.get((err, logs) => {
        if (err) { reject(err) };
        resolve(logs);
      });
    });
  }
};

module.exports = Utils;
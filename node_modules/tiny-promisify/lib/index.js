function promisify (fn, options) {
  if (typeof fn !== 'function') {
    throw new TypeError('first parameter is not a function')
  }

  const opts = Object.assign({
    context: {},
    multiArgs: false
  }, options)

  return function (...callArgs) {
    return new Promise(function (resolve, reject) {
      callArgs.push(function (err, result, ...rest) {
        if (err) {
          reject(err)
          return
        }

        if (opts.multiArgs) {
          resolve([result, ...rest])
        } else {
          resolve(result)
        }
      })

      fn.apply(opts.context, callArgs)
    })
  }
}

module.exports = promisify

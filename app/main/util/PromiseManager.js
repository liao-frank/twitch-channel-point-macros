class PromiseManager {
  constructor(promise, resolver, rejector) {
    this.promise = promise
    this.resolver = resolver
    this.rejector = rejector

    // Whether or not the promise was rejected by the manager.
    this.cancelled = false
    // Whether or not the promise was fulfilled (resolver or rejected, naturally or by the manager).
    this.completed = false
    // Whether or not the promise was resolved by the manager.
    this.shorted = false
  }

  // Immediately reject the promise.
  cancel() {
    this.rejector(new Error('Cancelled by PromiseManager.'))
    this.cancelled = true
    this.completed = true
  }

  // Immediately resolve the promise with the given value.
  short(value) {
    this.resolver(value)
    this.shorted = true
    this.completed = true
  }

  static from(promise) {
    let resolver
    let rejector

    const wrapperPromise = new Promise((res, rej) => {
      resolver = res
      rejector = rej
      promise
        .then(() => {
          this.completed = true
          res()
        })
        .catch(() => {
          this.completed = true
          rej()
        })
    })

    return new PromiseManager(wrapperPromise, resolver, rejector)
  }
}

module.exports = PromiseManager

class PromiseManager<T> {
  public readonly promise: Promise<T>
  public fulfilled = false
  public cancelled = false
  public shorted = false

  private resolver
  private rejector

  constructor(promise, resolver, rejector) {
    this.promise = promise
    this.resolver = resolver
    this.rejector = rejector
  }

  // Immediately reject the promise.
  cancel() {
    this.rejector(new Error('Cancelled by PromiseManager.'))
    this.cancelled = true
    this.fulfilled = true
  }

  // Immediately resolve the promise with the given value.
  short(value) {
    this.resolver(value)
    this.shorted = true
    this.fulfilled = true
  }

  static from(promise) {
    let resolver
    let rejector
    const wrapperPromise = new Promise((res, rej) => {
      resolver = res
      rejector = rej
    })

    const manager = new PromiseManager(wrapperPromise, resolver, rejector)

    promise
      .then(result => {
        manager.fulfilled = true
        resolver(result)
      })
      .catch(() => {
        manager.fulfilled = true
        rejector()
      })

    return manager
  }
}

export default PromiseManager

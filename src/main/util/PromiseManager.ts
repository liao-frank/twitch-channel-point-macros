class PromiseManager<T> {
  public readonly promise: Promise<T>

  public value: T | undefined

  public fulfilled = false // meaning that the operation was completed successfully.
  public shorted = false // meaning that the operation was manually completed successfully.

  public rejected = false // meaning that the operation failed.
  public cancelled = false // meaning that the operation manually failed.

  private resolver
  private rejector

  constructor(promise, resolver, rejector) {
    this.promise = promise

    // Set basic state when promise is complete.
    this.promise
      .then((value) => {
        this.fulfilled = true
        this.value = value
      })
      .catch((e) => {
        this.rejected = true
      })

    this.resolver = resolver
    this.rejector = rejector
  }

  // Immediately reject the promise.
  cancel() {
    this.rejector(new Error('Cancelled by PromiseManager.'))
    this.cancelled = true
  }

  // Immediately resolve the promise with the given value.
  short(value) {
    this.resolver(value)
    this.shorted = true
  }

  static from<X>(promise: Promise<X>): PromiseManager<X> {
    let resolver
    let rejector
    const wrapperPromise = new Promise((res, rej) => {
      resolver = res
      rejector = rej
    })

    const manager = new PromiseManager<X>(wrapperPromise, resolver, rejector)

    promise
      .then((result) => {
        manager.fulfilled = true
        resolver(result)
      })
      .catch(() => {
        manager.fulfilled = true
        rejector()
      })

    return manager
  }

  static dependent<X>(): PromiseManager<X> {
    return PromiseManager.from(new Promise(() => {}))
  }
}

export default PromiseManager

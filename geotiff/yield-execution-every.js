
export default class YieldExecutionEvery {
  constructor(yieldEveryMS) {
    this.yieldEveryMS = yieldEveryMS
    this.lastYieldTime = performance.now()
  }
  async maybeYield() {
    const timeSinceYield = performance.now() - this.lastYieldTime
    if (timeSinceYield > this.yieldEveryMS) {
      await new Promise(resolve => setTimeout(resolve, 0))
      this.lastYieldTime = performance.now()
    }
  }
}

import {
  withTestContext,
  clearFunctionContext,
  endCurrentStep
} from '../utils/testContext.js'

export const mochaHooks = {
  beforeEach(done) {
    const test = this.currentTest
    if (!test) return done()
    withTestContext(this.currentTest, () => done())
  },

  afterEach() {
    endCurrentStep()
    clearFunctionContext()
  }
}

const MochaAllureReporter = require('mocha-allure-reporter')

class CustomReporter extends MochaAllureReporter {
  constructor(runner, options) {
    super(runner, options)
    const log = globalThis.testLogger || console

    runner
      .on('start', () => {
        log.info('Test suite started')
      })
      .on('test', (test) => {
        log.info('Test started', { test: test.fullTitle() })
      })
      .on('pass', (test) => {
        log.info('Test passed', {
          test: test.fullTitle(),
          duration: `${test.duration}ms`
        })
      })
      .on('fail', (test, err) => {
        log.error('Test failed', {
          test: test.fullTitle(),
          error: err.message,
          stack: err.stack
        })
      })
      .on('pending', (test) => {
        log.info('Test skipped', { test: test.fullTitle() })
      })
      .on('end', () => {
        const s = this.stats
        log.info('Test suite finished', {
          passes: s.passes,
          failures: s.failures,
          duration: `${s.duration}ms`
        })
      })
  }
}

module.exports = CustomReporter

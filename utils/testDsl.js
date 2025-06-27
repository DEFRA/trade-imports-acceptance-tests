import { it } from 'mocha'
import path from 'path'
import { withTestContext } from './testContext.js'

function createTestCase(baseItFn) {
  function wrapper(titleOrId, titleOrFn, maybeFn) {
    let testId, title, fn

    if (typeof titleOrFn === 'function') {
      title = titleOrId
      fn = titleOrFn
    } else {
      testId = titleOrId
      title = titleOrFn
      fn = maybeFn
    }

    const test = baseItFn(title, function () {
      return withTestContext(this.test, () => fn.call(this))
    })

    test._testId = generateTestId(test, testId || '')
    return test
  }

  wrapper.only = function (titleOrId, titleOrFn, maybeFn) {
    let testId, title, fn

    if (typeof titleOrFn === 'function') {
      title = titleOrId
      fn = titleOrFn
    } else {
      testId = titleOrId
      title = titleOrFn
      fn = maybeFn
    }

    const test = baseItFn.only(title, function () {
      return withTestContext(this.test, () => fn.call(this))
    })

    test._testId = generateTestId(test, testId || '')
    return test
  }

  wrapper.skip = function (titleOrId, titleOrFn, maybeFn) {
    let testId, title, fn

    if (typeof titleOrFn === 'function') {
      title = titleOrId
      fn = titleOrFn
    } else {
      testId = titleOrId
      title = titleOrFn
      fn = maybeFn
    }

    const test = baseItFn.skip(title, function () {
      return fn.call(this)
    })

    test._testId = generateTestId(test, testId || '')
    return test
  }

  return wrapper
}

function generateTestId(test, specifiedId = '') {
  try {
    const parsed = path.parse(test.file)
    const folder = path.basename(parsed.dir)
    const fileName = parsed.name

    const parts = [folder, fileName]
    if (specifiedId) parts.push(specifiedId)

    const pascalParts = parts.map(toPascalCaseId)
    return pascalParts.join('.')
  } catch {
    return toPascalCaseId(specifiedId)
  }
}

export const testCase = createTestCase(it)

export function toPascalCaseId(input) {
  return input
    .replace(/[^\w\s.-]/g, '') // remove non-word characters except dot/dash
    .replace(/\s+/g, ' ') // normalize whitespace
    .replace(/[-_.]/g, ' ') // treat dash/dot/underscore as word boundaries
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

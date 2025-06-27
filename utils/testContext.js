import { AsyncLocalStorage } from 'node:async_hooks'

const testContext = new AsyncLocalStorage()

export function withTestContext(test, fn) {
  const context = {
    fullTitle: test.fullTitle?.() || test.title,
    testId: test._testId || test.title || null,
    functionName: null,
    currentStep: null,
    stepHistory: [],
    testData: {}
  }
  return testContext.run(context, fn)
}

export function withFunctionContext(functionName, fn) {
  const store = testContext.getStore()
  if (!store) return fn()

  const previous = store.functionName
  store.functionName = functionName

  try {
    return fn()
  } finally {
    store.functionName = previous
  }
}

export function setFunctionContext(functionName) {
  const current = testContext.getStore()
  if (current) {
    current.functionName = functionName
  }
}

export function clearFunctionContext() {
  const current = testContext.getStore()
  if (current) {
    current.functionName = null
  }
}

export function newStep(stepName) {
  const current = testContext.getStore()
  if (!current) return

  if (current.currentStep) {
    endCurrentStep()
  }

  const stepEntry = {
    name: stepName,
    startedAt: Date.now()
  }

  current.currentStep = stepEntry
  current.stepHistory.push(stepEntry)

  globalThis.testLogger?.info?.(`Starting step: ${stepName}`)
}

export function endCurrentStep() {
  const current = testContext.getStore()
  if (current?.currentStep) {
    current.currentStep = null
  }
}

export function getCurrentStep() {
  return testContext.getStore()?.currentStep ?? null
}

export function getCurrentStepStartTime() {
  return getCurrentStep()?.startedAt ?? null
}

export function getPreviousStep(offset = -1) {
  const history = getStepHistory()
  if (!history.length || Math.abs(offset) > history.length) return null

  const index = history.length + offset
  return history[index] ?? null
}

export function getPreviousStepStartTime(offset = -1) {
  return getPreviousStep(offset)?.startedAt ?? null
}

export function getStep(index) {
  return getStepHistory().at(index) ?? null
}

export function getStepStartTime(stepName) {
  const current = testContext.getStore()
  return (
    current?.stepHistory?.find((s) => s.name === stepName)?.startedAt ?? null
  )
}

export function getStepHistory() {
  return testContext.getStore()?.stepHistory ?? []
}

export function getCurrentTestContext() {
  return testContext.getStore() || {}
}

export const testData = new Proxy(
  {},
  {
    get(_, prop) {
      const ctx = getCurrentTestContext()
      return ctx?.testData?.[prop]
    },
    set(_, prop, value) {
      const ctx = getCurrentTestContext()
      if (ctx && typeof ctx.testData === 'object') {
        ctx.testData[prop] = value
        if (shouldAutoLogTestData()) {
          global.testLogger?.debug?.(
            `Test data set: ${String(prop)} = ${stringifyBrief(value)}`
          )
        }
      }
      return true
    },
    has(_, prop) {
      const ctx = getCurrentTestContext()
      return ctx?.testData?.hasOwnProperty(prop)
    },
    deleteProperty(_, prop) {
      const ctx = getCurrentTestContext()
      if (ctx?.testData && prop in ctx.testData) {
        delete ctx.testData[prop]
        return true
      }
      return false
    },
    ownKeys() {
      return Object.keys(getCurrentTestContext().testData ?? {})
    },
    getOwnPropertyDescriptor(_, prop) {
      return { enumerable: true, configurable: true }
    }
  }
)

function shouldAutoLogTestData() {
  const level = process.env.LOG_LEVEL?.toLowerCase()
  return level === 'debug' || level === 'trace'
}

function stringifyBrief(value) {
  try {
    return typeof value === 'object'
      ? JSON.stringify(value, (_, v) =>
          typeof v === 'string' && v.length > 100 ? v.slice(0, 100) + '...' : v
        )
      : String(value)
  } catch {
    return '[Unserializable]'
  }
}

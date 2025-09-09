import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'

const ENDPOINTS = {
  IPAFFS: (key) =>
    `${BASE_URL_TRADE_IMPORTS_DATA_API}/import-pre-notifications/${key}`,
  ERROR: (key) => `${BASE_URL_TRADE_IMPORTS_DATA_API}/processing-errors/${key}`,
  DEFAULT: (key) =>
    `${BASE_URL_TRADE_IMPORTS_DATA_API}/customs-declarations/${key}`
}

// eslint-disable-next-line no-unused-vars
function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

function deepMatch(actual, expected) {
  if (typeof expected !== 'object' || expected === null) {
    return actual === expected
  }

  if (typeof actual !== 'object' || actual === null) {
    return false
  }

  return Object.entries(expected).every(([key, value]) =>
    deepMatch(actual[key], value)
  )
}

export async function waitForDataInAPI(
  key,
  collection,
  expectedProperties = null,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS,
  stabilityDuration = 0
) {
  const url = (ENDPOINTS[collection] || ENDPOINTS.DEFAULT)(key)

  let lastResponse, lastResponseText
  let stableStartTime = null
  let lastStableState = null

  try {
    await pWaitFor(
      async () => {
        try {
          testLogger.info(`Polling: ${url}`)

          const resp = await request(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER
            }
          })

          lastResponse = resp
          lastResponseText = await resp.body.text()

          if (resp.statusCode !== 200) {
            testLogger.error(`Error polling for key: ${key}`, {
              lastResponse,
              lastResponseText
            })
            // Reset stability tracking on error
            stableStartTime = null
            lastStableState = null
            return false
          }

          let parsed
          try {
            parsed = JSON.parse(lastResponseText)
            testLogger.info(parsed)
          } catch {
            parsed = null
            testLogger.info(lastResponseText)
          }

          // Check if current state matches expected properties
          let currentStateMatches = true
          if (expectedProperties && parsed) {
            const match = deepMatch(parsed, expectedProperties)
            if (!match) {
              testLogger.info(`Expected properties not met yet`)
              currentStateMatches = false
            }
          } else if (expectedProperties && !parsed) {
            currentStateMatches = false
          }

          // For stability checking, we need to ensure the state remains consistent
          if (stabilityDuration > 0) {
            const currentState = JSON.stringify(parsed)

            if (currentStateMatches) {
              if (lastStableState === null) {
                // First time we see the expected state
                lastStableState = currentState
                stableStartTime = Date.now()
                testLogger.info(
                  `Stability check started at ${new Date(stableStartTime).toISOString()}`
                )
              } else if (lastStableState === currentState) {
                // State is still the same, check if we've been stable long enough
                const stableDuration = Date.now() - stableStartTime
                if (stableDuration >= stabilityDuration) {
                  testLogger.info(
                    `State has been stable for ${stableDuration}ms (required: ${stabilityDuration}ms)`
                  )
                  return true
                } else {
                  testLogger.info(
                    `State stable for ${stableDuration}ms, waiting for ${stabilityDuration - stableDuration}ms more`
                  )
                  return false
                }
              } else {
                // State changed, reset stability tracking
                testLogger.info(`State changed, resetting stability check`)
                lastStableState = currentState
                stableStartTime = Date.now()
                return false
              }
            } else {
              // Current state doesn't match expected properties
              stableStartTime = null
              lastStableState = null
              return false
            }
          } else {
            // No stability duration required, return immediately if state matches
            return currentStateMatches
          }

          return false
        } catch (err) {
          testLogger.error({ err })
          // Reset stability tracking on error
          stableStartTime = null
          lastStableState = null
          return false
        }
      },
      { interval, timeout }
    )

    return lastResponseText
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(`Timeout polling for key: ${key}`, { err, lastResponse })
    } else {
      testLogger.error(`Error polling for key: ${key}`, { err, lastResponse })
    }
    throw err
  }
}

// Convenience function for waiting with stability duration
export async function waitForDataInAPIWithStability(
  key,
  collection,
  expectedProperties = null,
  stabilityDuration = 30000,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  return waitForDataInAPI(
    key,
    collection,
    expectedProperties,
    timeout,
    interval,
    stabilityDuration
  )
}

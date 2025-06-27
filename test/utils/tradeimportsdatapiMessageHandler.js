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
  interval = POLL_INTERVAL_MS
) {
  const url = (ENDPOINTS[collection] || ENDPOINTS.DEFAULT)(key)

  let lastResponse, lastResponseText

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

          if (expectedProperties && parsed) {
            const match = deepMatch(parsed, expectedProperties)
            if (!match) {
              testLogger.info(`Expected properties not met yet`)
              return false
            }
          }

          return true
        } catch (err) {
          testLogger.error({ err })
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

import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'

export async function getExistingDecisions(mrn) {
  const url = `${BASE_URL_TRADE_IMPORTS_DECISION_COMPARER}/decisions/${mrn}`

  const resp = await request(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: COMPARER_AUTHORIZATION_HEADER
    }
  })

  const body = await resp.body.text()
  const data = JSON.parse(body)

  return data.btmsDecision?.decisions ?? []
}

export async function waitForDecision(
  mrn,
  existingDecisions = [],
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  if (!Array.isArray(existingDecisions)) {
    existingDecisions = await getExistingDecisions(mrn)
  }
  const url = `${BASE_URL_TRADE_IMPORTS_DECISION_COMPARER}/decisions/${mrn}`

  const knownCreated = new Set(existingDecisions.map((d) => d.created))

  let lastResponse = null
  let lastResponseText = ''
  let decisionsXml = null

  try {
    await pWaitFor(
      async () => {
        try {
          testLogger.info(`Polling: ${url}`)

          const resp = await request(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: COMPARER_AUTHORIZATION_HEADER
            }
          })

          lastResponse = resp
          lastResponseText = await resp.body.text()

          if (resp.statusCode !== 200) {
            lastError = new Error(`Unexpected status code: ${resp.statusCode}`)
            return false
          }

          const data = JSON.parse(lastResponseText)
          const decisions = data.btmsDecision?.decisions ?? []

          const newDecisions = decisions.filter(
            (d) => !knownCreated.has(d.created)
          )

          if (newDecisions.length === 0) {
            return false
          }

          decisionsXml = newDecisions[0].xml
          testLogger.info('New decision found', {
            created: newDecisions[0].created
          })

          return true
        } catch (err) {
          testLogger.error('Error during request:', err)
          return false
        }
      },
      { interval, timeout }
    )

    return decisionsXml
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(`Timed out polling for new decision for MRN: ${mrn}`, {
        err,
        lastResponse,
        lastResponseText
      })
    } else {
      testLogger.error({ err, lastResponse, lastResponseText })
    }
    throw err
  }
}

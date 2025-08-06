import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'
import { extractDecisionCodes } from './decisionParser.js'

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

export async function waitForSpecificDecision(
  mrn,
  expectedDecisionCode,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  const url = `${BASE_URL_TRADE_IMPORTS_DECISION_COMPARER}/decisions/${mrn}`

  testLogger.info(
    `Starting to wait for decision code ${expectedDecisionCode} for MRN: ${mrn}`
  )

  try {
    let foundXml = null

    await pWaitFor(
      async () => {
        const resp = await request(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: COMPARER_AUTHORIZATION_HEADER
          }
        })

        if (resp.statusCode !== 200) {
          testLogger.info(`API returned status ${resp.statusCode}`)
          return false
        }

        const data = JSON.parse(await resp.body.text())
        const decisions = data.btmsDecision?.decisions ?? []

        testLogger.info(
          `Found ${decisions.length} total decisions for MRN: ${mrn}`
        )

        if (decisions.length === 0) {
          return false
        }

        // Check if any decision contains the expected code
        for (const decision of decisions) {
          const decisionCodes = extractDecisionCodes(decision.xml)
          testLogger.info(`Decision codes found: ${decisionCodes.join(', ')}`)

          if (decisionCodes.includes(expectedDecisionCode)) {
            testLogger.info('Found expected decision code', {
              expectedCode: expectedDecisionCode,
              foundCodes: decisionCodes
            })
            foundXml = decision.xml
            return true
          }
        }

        testLogger.info(
          `Expected code ${expectedDecisionCode} not found in decisions`
        )
        return false
      },
      { interval, timeout }
    )

    return foundXml
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(
        `Timed out waiting for decision code ${expectedDecisionCode} for MRN: ${mrn}`
      )
    }
    throw err
  }
}

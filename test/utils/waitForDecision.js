import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'
import { extractDecisionCodes } from './decisionParser.js'
import { waitForDataInAPI } from './tradeimportsdatapiMessageHandler.js'

export async function getExistingDecisions(mrn) {
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/decision-notifications?mrn=${mrn}`

  const resp = await request(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CDS_SIMULATOR_AUTHORIZATION_HEADER
    }
  })

  const body = await resp.body.text()
  const data = JSON.parse(body)

  return data ?? []
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
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/decision-notifications?mrn=${mrn}`

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
              Authorization: CDS_SIMULATOR_AUTHORIZATION_HEADER
            }
          })

          lastResponse = resp
          lastResponseText = await resp.body.text()

          if (resp.statusCode !== 200) {
            lastError = new Error(`Unexpected status code: ${resp.statusCode}`)
            return false
          }

          const data = JSON.parse(lastResponseText)
          const decisions = data ?? []

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
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/decision-notifications?mrn=${mrn}`

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
            Authorization: CDS_SIMULATOR_AUTHORIZATION_HEADER
          }
        })

        if (resp.statusCode !== 200) {
          testLogger.info(`API returned status ${resp.statusCode}`)
          return false
        }

        const data = JSON.parse(await resp.body.text())
        const decisions = data ?? []

        testLogger.info(
          `Found ${decisions.length} total decisions for MRN: ${mrn}`
        )

        if (decisions.length === 0) {
          return false
        }

        // Check if any decision contains the expected code
        for (const decision of decisions) {
          const decisionCodes = extractDecisionCodes(decision.xml)
          const codeStrings = decisionCodes.map(
            (dc) => `${dc.checkCode}:${dc.decisionCode}`
          )
          testLogger.info(`Decision codes found: ${codeStrings.join(', ')}`)

          if (
            decisionCodes.some((dc) => dc.decisionCode === expectedDecisionCode)
          ) {
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

export async function waitForSpecificCheckDecision(
  mrn,
  expectedCheckCode,
  expectedDecisionCode,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/decision-notifications?mrn=${mrn}`

  testLogger.info(
    `Starting to wait for check code ${expectedCheckCode} with decision code ${expectedDecisionCode} for MRN: ${mrn}`
  )

  try {
    let foundXml = null

    await pWaitFor(
      async () => {
        const resp = await request(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: CDS_SIMULATOR_AUTHORIZATION_HEADER
          }
        })

        if (resp.statusCode !== 200) {
          testLogger.info(`API returned status ${resp.statusCode}`)
          return false
        }

        const data = JSON.parse(await resp.body.text())
        const decisions = data ?? []

        testLogger.info(
          `Found ${decisions.length} total decisions for MRN: ${mrn}`
        )

        if (decisions.length === 0) {
          return false
        }

        // Check if any decision contains the expected check and decision code combination
        for (const decision of decisions) {
          const decisionCodes = extractDecisionCodes(decision.xml)
          const codeStrings = decisionCodes.map(
            (dc) => `${dc.checkCode}:${dc.decisionCode}`
          )
          testLogger.info(`Decision codes found: ${codeStrings.join(', ')}`)

          if (
            decisionCodes.some(
              (dc) =>
                dc.checkCode === expectedCheckCode &&
                dc.decisionCode === expectedDecisionCode
            )
          ) {
            foundXml = decision.xml
            return true
          }
        }

        testLogger.info(
          `Expected combination ${expectedCheckCode}:${expectedDecisionCode} not found in decisions`
        )
        return false
      },
      { interval, timeout }
    )

    return foundXml
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(
        `Timed out waiting for check code ${expectedCheckCode} with decision code ${expectedDecisionCode} for MRN: ${mrn}`
      )
    }
    throw err
  }
}

export async function waitForSpecificCheckDecisionWithChedRef(
  mrn,
  expectedCheckCode,
  expectedDecisionCode,
  expectedChedReference,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  testLogger.info(
    `Starting to wait for check code ${expectedCheckCode} with decision code ${expectedDecisionCode} and CHED reference ${expectedChedReference} for MRN: ${mrn}`
  )

  testLogger.info({
    checkCode: expectedCheckCode,
    decisionCode: expectedDecisionCode,
    documentReference: expectedChedReference
  })
  try {
    // eslint-disable-next-line no-unused-vars
    let foundMatch = false
    let lastApiResponse = null

    await pWaitFor(
      async () => {
        try {
          // Use waitForDataInAPI to get the full JSON response
          const apiResponseText = await waitForDataInAPI(
            mrn,
            undefined,
            null,
            10000, // Short timeout for individual calls
            1000 // Short interval for individual calls
          )
          lastApiResponse = JSON.parse(apiResponseText)

          // Check if the clearanceDecision.results contains the expected CHED reference
          const hasChedRef = lastApiResponse.clearanceDecision?.results?.some(
            (result) =>
              result.checkCode === expectedCheckCode &&
              result.decisionCode === expectedDecisionCode &&
              result.documentReference === expectedChedReference
          )

          if (hasChedRef) {
            testLogger.info(
              `✅ Found matching CHED reference: ${expectedChedReference}`
            )
            foundMatch = true
            return true
          } else {
            // Log what we found for debugging
            const foundResults =
              lastApiResponse.clearanceDecision?.results?.filter(
                (result) =>
                  result.checkCode === expectedCheckCode &&
                  result.decisionCode === expectedDecisionCode
              ) || []

            testLogger.info(
              `CHED reference ${expectedChedReference} not found yet. Found results for ${expectedCheckCode}:${expectedDecisionCode}:`,
              foundResults.map((r) => r.documentReference)
            )
            return false
          }
        } catch (err) {
          testLogger.info(`Error checking for CHED reference: ${err.message}`)
          return false
        }
      },
      { interval: 2000, timeout } // Use the provided timeout and interval
    )

    return JSON.stringify(lastApiResponse)
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(
        `Timed out waiting for check code ${expectedCheckCode} with decision code ${expectedDecisionCode} and CHED reference ${expectedChedReference} for MRN: ${mrn}`
      )
    }
    throw err
  }
}

export async function waitForGmrDeclaration(
  gmrId,
  mrn,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  const url = `${BASE_URL_TRADE_IMPORTS_DATA_API}/related-import-declarations?gmrid=${gmrId}`

  testLogger.info(`Waiting for MRN ${mrn} under GMR ${gmrId}...`)

  try {
    let foundPayload = null

    await pWaitFor(
      async () => {
        const resp = await request(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER
          }
        })

        if (resp.statusCode !== 200) {
          testLogger.info(`API returned ${resp.statusCode}`)
          return false
        }

        const data = JSON.parse(await resp.body.text())

        const customsDeclarations = data.customsDeclarations ?? []
        const goodsVehicleMovements = data.goodsVehicleMovements ?? []

        testLogger.info(
          `Found ${customsDeclarations.length} customs declarations and ${goodsVehicleMovements.length} for GMR ${gmrId}`
        )

        // Look for matching MRN
        const match = customsDeclarations.find(
          (decl) => decl.movementReferenceNumber === mrn
        )

        if (match) {
          testLogger.info(`Found matching MRN ${mrn} under GMR ${gmrId}`)
          foundPayload = match
          return true
        }

        testLogger.info(`MRN ${mrn} not found yet for GMR ${gmrId}`)
        return false
      },
      { interval, timeout }
    )

    return foundPayload
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(`Timed out waiting for MRN ${mrn} under GMR ${gmrId}`)
    }
    throw err
  }
}

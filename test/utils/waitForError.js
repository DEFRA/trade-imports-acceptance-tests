import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'
import { extractErrorCodes } from './errorParser.js'

export async function getExistingErrors(mrn) {
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/error-notifications?mrn=${mrn}`

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

export async function waitForError(
  mrn,
  existingErrors = [],
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  if (!Array.isArray(existingErrors)) {
    existingErrors = await getExistingErrors(mrn)
  }
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/error-notifications?mrn=${mrn}`

  const knownCreated = new Set(existingErrors.map((e) => e.timestamp))

  let lastResponse = null
  let lastResponseText = ''
  let errorsXml = null

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
          const errors = data ?? []

          const newErrors = errors.filter((e) => !knownCreated.has(e.timestamp))

          if (newErrors.length === 0) {
            return false
          }

          errorsXml = newErrors[0].xml
          testLogger.info('New error found', {
            timestamp: newErrors[0].timestamp
          })

          return true
        } catch (err) {
          testLogger.error('Error during request:', err)
          return false
        }
      },
      { interval, timeout }
    )

    return errorsXml
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(`Timed out polling for new error for MRN: ${mrn}`, {
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

export async function waitForErrorInCDS(
  mrn,
  expectedErrors,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  // Handle both object format ({errorCode, errorMessage}) and legacy format (codes, content)
  let errorCodesArray = []
  let errorContentArray = []
  let errorObjects = null

  // Detect if this is the object format
  if (
    Array.isArray(expectedErrors) &&
    expectedErrors.length > 0 &&
    typeof expectedErrors[0] === 'object' &&
    'errorCode' in expectedErrors[0]
  ) {
    // Object format: [{errorCode: 'ALVSVAL303', errorMessage: 'msg'}]
    errorObjects = expectedErrors
    errorCodesArray = expectedErrors
      .map((err) => err.errorCode)
      .filter((code) => code && code !== '')
    errorContentArray = expectedErrors
      .map((err) => err.errorMessage)
      .filter((msg) => msg && msg !== '')
  } else {
    // Legacy format as single parameter
    errorCodesArray = Array.isArray(expectedErrors)
      ? expectedErrors
      : [expectedErrors]
  }

  if (errorCodesArray.length === 0) {
    throw new Error('At least one error code must be provided')
  }

  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/error-notifications?mrn=${mrn}`

  testLogger.info(
    `Starting to wait for error codes in CDS: [${errorCodesArray.join(', ')}] for MRN: ${mrn}`
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
        const errors = data ?? []

        testLogger.info(`Found ${errors.length} total errors for MRN: ${mrn}`)

        if (errors.length === 0) {
          return false
        }

        // Check if any error contains any of the expected codes
        for (const error of errors) {
          const errorCodes = extractErrorCodes(error.xml)
          const codeStrings = errorCodes.map((ec) => ec.errorCode)
          testLogger.info(`Error codes found: ${codeStrings.join(', ')}`)

          const foundAnyCode = errorCodes.some((ec) =>
            errorCodesArray.includes(ec.errorCode)
          )

          if (foundAnyCode) {
            foundXml = error.xml

            // Validate error messages if using object format
            if (errorObjects) {
              const hasValidPair = errorObjects.some((errorObj) => {
                const hasCode = error.xml.includes(errorObj.errorCode)
                const hasMessage =
                  !errorObj.errorMessage ||
                  errorObj.errorMessage === '' ||
                  error.xml.includes(errorObj.errorMessage)
                return hasCode && hasMessage
              })

              if (!hasValidPair) {
                testLogger.info(
                  `Found error code but message validation failed, continuing search...`
                )
                return false // Continue searching for a valid pair
              }
            }

            return true
          }
        }

        testLogger.info(
          `None of the expected error codes [${errorCodesArray.join(', ')}] found in errors`
        )
        return false
      },
      { interval, timeout }
    )

    // Final validation
    if (foundXml && errorObjects) {
      const foundCodes = errorCodesArray.filter((code) =>
        foundXml.includes(code)
      )
      const foundMessages = errorContentArray.filter(
        (msg) => msg && msg !== '' && foundXml.includes(msg)
      )

      testLogger.info('Validating error message in XML:', {
        errorCodes: errorCodesArray,
        errorMessages: errorContentArray,
        xmlLength: foundXml.length,
        foundCodes,
        foundMessages
      })
    }

    return foundXml
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(
        `Timed out waiting for error codes [${errorCodesArray.join(', ')}] for MRN: ${mrn}`
      )
    }
    throw err
  }
}

export async function waitForSpecificError(
  mrn,
  expectedErrorCode,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  const url = `${BASE_URL_TRADE_IMPORTS_CDS_SIMULATOR}/error-notifications?mrn=${mrn}`

  testLogger.info(
    `Starting to wait for error code ${expectedErrorCode} for MRN: ${mrn}`
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
        const errors = data ?? []

        testLogger.info(`Found ${errors.length} total errors for MRN: ${mrn}`)

        if (errors.length === 0) {
          return false
        }

        // Check if any error contains the expected code
        for (const error of errors) {
          const errorCodes = extractErrorCodes(error.xml)
          const codeStrings = errorCodes.map((ec) => ec.errorCode)
          testLogger.info(`Error codes found: ${codeStrings.join(', ')}`)

          if (errorCodes.some((ec) => ec.errorCode === expectedErrorCode)) {
            foundXml = error.xml
            return true
          }
        }

        testLogger.info(
          `Expected error code ${expectedErrorCode} not found in errors`
        )
        return false
      },
      { interval, timeout }
    )

    return foundXml
  } catch (err) {
    if (err instanceof TimeoutError) {
      testLogger.error(
        `Timed out waiting for error code ${expectedErrorCode} for MRN: ${mrn}`
      )
    }
    throw err
  }
}

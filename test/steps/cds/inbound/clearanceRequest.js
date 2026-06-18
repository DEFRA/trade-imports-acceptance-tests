import { SoapMessageBuilder } from '#utils/soapMessageBuilder.js'
import { waitForDataInAPI } from '#utils/tradeimportsdatapiMessageHandler.js'
import { assert } from 'chai'

// Internal helper function for fluent APIs
async function sendClearanceRequest(clearanceRequest) {
  globalThis.testLogger.info('Sending ClearanceRequest')
  thisStepStartTime = Date.now()
  await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, clearanceRequest)
}

// Internal helper function for fluent APIs
async function expectErrorResponse(
  mrn,
  expectedErrorPattern,
  customErrorMessage = null
) {
  const responseText = await waitForDataInAPI(mrn, 'ERROR')
  const defaultMessage = `Expected error message containing: '${expectedErrorPattern}'`
  const errorMessage = customErrorMessage || defaultMessage

  globalThis.assert.ok(
    responseText.includes(expectedErrorPattern),
    errorMessage
  )
  return responseText
}

// Enhanced fluent API for complete test workflows
export class ClearanceRequestTestBuilder {
  constructor() {
    this.builder = new SoapMessageBuilder()
    this.mrn = null
    this.sent = false
  }

  withCommodity(taricCode, overrides = {}) {
    this.builder.withCommodity(taricCode, overrides)
    return this
  }

  withDocument(documentCode, documentReference, overrides = {}) {
    this.builder.withDocument(documentCode, documentReference, overrides)
    return this
  }

  withOnlyDocument(documentCode, documentReference, overrides = {}) {
    this.builder.withOnlyDocument(documentCode, documentReference, overrides)
    return this
  }

  withCheck(checkCode, departmentCode, overrides = {}) {
    this.builder.withCheck(checkCode, departmentCode, overrides)
    return this
  }

  withMRN(mrn) {
    this.mrn = mrn
    this.builder.withMRN(mrn)
    return this
  }

  withEntryVersionNumber(entryVersionNumber) {
    this.builder.withEntryVersionNumber(entryVersionNumber)
    return this
  }

  withPreviousVersionNumber(previousVersionNumber) {
    this.builder.withPreviousVersionNumber(previousVersionNumber)
    return this
  }

  addItem(overrides = {}) {
    this.builder.addItem(overrides)
    return this
  }

  withCorrelationId(correlationId) {
    this.builder.withCorrelationId(correlationId)
    return this
  }

  withDispatchCountryCode(dispatchCountryCode) {
    this.builder.withDispatchCountryCode(dispatchCountryCode)
    return this
  }

  async sendClearanceRequest() {
    if (!this.mrn) {
      this.mrn = globalThis.generateRandomMRN()
      this.builder.withMRN(this.mrn)
    }

    const soapEnvelope = this.builder.buildModel().buildMessage()
    await sendClearanceRequest(soapEnvelope)
    this.sent = true
    return this
  }

  async waitForDecision(expectedDecisionCode) {
    if (!this.sent) {
      throw new Error(
        'Must call sendClearanceRequest() before waitForDecision()'
      )
    }

    return await globalThis.waitForSpecificDecision(
      this.mrn,
      expectedDecisionCode
    )
  }

  async waitForCheckDecision(expectedCheckCode, expectedDecisionCode) {
    if (!this.sent) {
      throw new Error(
        'Must call sendClearanceRequest() before waitForCheckDecision()'
      )
    }

    return globalThis.waitForSpecificCheckDecision(
      this.mrn,
      expectedCheckCode,
      expectedDecisionCode
    )
  }

  async waitForCheckDecisionWithChedRef(
    expectedCheckCode,
    expectedDecisionCode,
    expectedChedReference
  ) {
    if (!this.sent) {
      throw new Error(
        'Must call sendClearanceRequest() before waitForCheckDecisionWithChedRef()'
      )
    }

    return globalThis.waitForSpecificCheckDecisionWithChedRef(
      this.mrn,
      expectedCheckCode,
      expectedDecisionCode,
      expectedChedReference
    )
  }

  async waitForSpecificError(expectedErrorCode) {
    if (!this.sent) {
      throw new Error(
        'Must call sendClearanceRequest() before waitForSpecificError()'
      )
    }

    return globalThis.waitForSpecificError(this.mrn, expectedErrorCode)
  }

  async expectErrorResponse(expectedErrorPattern, customErrorMessage = null) {
    if (!this.sent) {
      throw new Error(
        'Must call sendClearanceRequest() before expectErrorResponse()'
      )
    }
    return await expectErrorResponse(
      this.mrn,
      expectedErrorPattern,
      customErrorMessage
    )
  }

  async expectDecision(expectedDecisionCode) {
    if (!this.sent) {
      throw new Error(
        'Must call sendClearanceRequest() before expectDecision()'
      )
    }
    const decisionXml = await globalThis.waitForSpecificDecision(
      this.mrn,
      expectedDecisionCode
    )
    const codes = await globalThis.extractDecisionCodes(decisionXml)
    globalThis.testLogger.info('Received decision codes:', {
      decisionCodes: codes
    })
    return decisionXml
  }

  async waitForGmrCustomDeclaration(expectedGmr, expectedMrn) {
    return globalThis.waitForGmrDeclaration(expectedGmr, expectedMrn)
  }

  getMrn() {
    return this.mrn
  }
}

// Fluent API that handles the entire test workflow
export class FluentClearanceRequestTest {
  constructor() {
    this.builder = new ClearanceRequestTestBuilder()
  }

  withCommodity(taricCode, overrides = {}) {
    this.builder.withCommodity(taricCode, overrides)
    return this
  }

  withDocument(documentCode, documentReference, overrides = {}) {
    this.builder.withDocument(documentCode, documentReference, overrides)
    return this
  }

  withOnlyDocument(documentCode, documentReference, overrides = {}) {
    this.builder.withOnlyDocument(documentCode, documentReference, overrides)
    return this
  }

  withCheck(checkCode, departmentCode, overrides = {}) {
    this.builder.withCheck(checkCode, departmentCode, overrides)
    return this
  }

  withMRN(mrn) {
    this.builder.withMRN(mrn)
    return this
  }

  withEntryVersionNumber(entryVersionNumber) {
    this.builder.withEntryVersionNumber(entryVersionNumber)
    return this
  }

  withPreviousVersionNumber(previousVersionNumber) {
    this.builder.withPreviousVersionNumber(previousVersionNumber)
    return this
  }

  addItem(overrides = {}) {
    this.builder.addItem(overrides)
    return this
  }

  withCorrelationId(correlationId) {
    this.builder.withCorrelationId(correlationId)
    return this
  }

  withDispatchCountryCode(dispatchCountryCode) {
    this.builder.withDispatchCountryCode(dispatchCountryCode)
    return this
  }

  // Method that handles the complete workflow: send + expect error
  async sendAndExpectError(expectedErrorPattern) {
    await this.builder.sendClearanceRequest()
    return await this.builder.expectErrorResponse(expectedErrorPattern)
  }

  // Method that handles the complete workflow: send + expect decision
  async sendAndExpectDecision(expectedDecisionCode) {
    await this.builder.sendClearanceRequest()
    return await this.builder.expectDecision(expectedDecisionCode)
  }

  // Individual methods for when you need more control
  async sendClearanceRequest() {
    await this.builder.sendClearanceRequest()
    return this
  }

  async expectErrorResponse(expectedErrorPattern, customErrorMessage = null) {
    if (typeof expectedErrorPattern === 'string') {
      await this.builder.expectErrorResponse(
        expectedErrorPattern,
        customErrorMessage
      )
    } else if (
      typeof expectedErrorPattern === 'object' &&
      expectedErrorPattern.code
    ) {
      // Handle structured error validation
      await this.expectMultipleErrors([expectedErrorPattern])
    } else {
      throw new Error(
        'expectErrorResponse expects either a string pattern or an error object with code, messageTemplate, and params'
      )
    }
    return this
  }

  async expectDecision(expectedDecisionCode) {
    await this.builder.expectDecision(expectedDecisionCode)
    return this
  }

  async waitForDecision(expectedDecisionCode) {
    await this.builder.waitForDecision(expectedDecisionCode)
    return this
  }

  async waitForCheckDecision(expectedCheckCode, expectedDecisionCode) {
    await this.builder.waitForCheckDecision(
      expectedCheckCode,
      expectedDecisionCode
    )
    return this
  }

  async waitForCheckDecisionWithChedRef(
    expectedCheckCode,
    expectedDecisionCode,
    expectedChedReference
  ) {
    await this.builder.waitForCheckDecisionWithChedRef(
      expectedCheckCode,
      expectedDecisionCode,
      expectedChedReference
    )
    return this
  }

  async waitForGmrCustomDeclaration(expectedGmr, expectedMrn) {
    await this.builder.waitForGmrCustomDeclaration(expectedGmr, expectedMrn)
    return this
  }

  getMrn() {
    return this.builder.getMrn()
  }

  // Fluent interface for async operations
  send() {
    return {
      send: () => this.sendClearanceRequest(),
      expectError: (expectedErrorPattern) => {
        const expectErrorPromise = this.sendClearanceRequest().then(
          async () => {
            await this.expectErrorResponse(expectedErrorPattern)
          }
        )

        // Create a thenable object that supports method chaining
        return Object.assign(expectErrorPromise, {
          waitForErrorInCDS: (expectedErrors, expectedErrorContent) =>
            expectErrorPromise.then(async () => {
              // Handle both object format ({errorCode, errorMessage}) and legacy format (codes, content)
              let errorCodesArray = []
              let errorContentArray = []

              if (
                Array.isArray(expectedErrors) &&
                expectedErrors.length > 0 &&
                typeof expectedErrors[0] === 'object' &&
                'errorCode' in expectedErrors[0]
              ) {
                // New object format: [{errorCode: 'ALVSVAL320', errorMessage: 'msg'}, ...]
                errorCodesArray = expectedErrors
                  .map((err) => err.errorCode)
                  .filter((code) => code && code !== '')
                errorContentArray = expectedErrors
                  .map((err) => err.errorMessage)
                  .filter((msg) => msg && msg !== '')
              } else {
                // Legacy format: ('ALVSVAL320', 'message')
                errorCodesArray = Array.isArray(expectedErrors)
                  ? expectedErrors
                  : [expectedErrors]
                errorContentArray = expectedErrorContent
                  ? Array.isArray(expectedErrorContent)
                    ? expectedErrorContent
                    : [expectedErrorContent]
                  : []
              }

              if (errorCodesArray.length === 0) {
                throw new Error('At least one error code must be provided')
              }

              let errorXml = null
              // Wait for any of the specified error codes
              for (const errorCode of errorCodesArray) {
                try {
                  errorXml = await this.builder.waitForSpecificError(errorCode)
                  break // Found one, stop looking
                } catch (err) {
                  // Continue to next error code if this one times out
                  continue
                }
              }

              // Validate that we found any error code
              if (!errorXml) {
                throw new Error(
                  `None of the expected error codes [${errorCodesArray.join(', ')}] were found in CDS notifications`
                )
              }

              // Validate error codes and messages if provided
              if (expectedErrors || expectedErrorContent) {
                const hasAnyErrorCode = errorCodesArray.some((code) =>
                  errorXml.includes(code)
                )
                assert(
                  hasAnyErrorCode,
                  `Expected error XML to contain one of error codes [${errorCodesArray.join(', ')}]`
                )

                // Enhanced validation for object format: check specific code-message pairs
                if (
                  Array.isArray(expectedErrors) &&
                  expectedErrors.length > 0 &&
                  typeof expectedErrors[0] === 'object' &&
                  'errorCode' in expectedErrors[0]
                ) {
                  // Object format validation: check if XML contains any valid code-message pair
                  const hasValidPair = expectedErrors.some((errorObj) => {
                    const hasCode = errorXml.includes(errorObj.errorCode)
                    const hasMessage =
                      !errorObj.errorMessage ||
                      errorObj.errorMessage === '' ||
                      errorXml.includes(errorObj.errorMessage)
                    return hasCode && hasMessage
                  })

                  if (!hasValidPair) {
                    const foundCodes = errorCodesArray.filter((code) =>
                      errorXml.includes(code)
                    )
                    const foundMessages = errorContentArray.filter(
                      (msg) => msg && msg !== '' && errorXml.includes(msg)
                    )

                    let errorMsg = `Expected error XML to contain a valid error code-message pair.\n`
                    errorMsg += `- Expected pairs: ${expectedErrors.map((e) => `{code: '${e.errorCode}', message: '${e.errorMessage}'}`).join(', ')}\n`
                    errorMsg += `- Found codes: [${foundCodes.join(', ')}]\n`
                    errorMsg += `- Found messages: [${foundMessages.join(', ')}]\n`
                    errorMsg += `- Partial XML: ${errorXml.substring(0, 500)}...`

                    assert(false, errorMsg)
                  }
                } else {
                  // Legacy format validation: check both codes and any of the messages together
                  const hasExpectedError = errorCodesArray.some((code) => {
                    return (
                      errorXml.includes(code) &&
                      errorContentArray.some(
                        (errorMsg) =>
                          errorMsg === '' || errorXml.includes(errorMsg)
                      )
                    )
                  })

                  if (!hasExpectedError) {
                    const foundCodes = errorCodesArray.filter((code) =>
                      errorXml.includes(code)
                    )
                    const foundMessages = errorContentArray.filter(
                      (message) =>
                        message && message !== '' && errorXml.includes(message)
                    )

                    let errorMsg = `Expected error XML to contain at least one error code AND one error message.\n`
                    errorMsg += `- Expected codes: [${errorCodesArray.join(', ')}]\n`
                    errorMsg += `- Found codes: [${foundCodes.join(', ')}]\n`
                    errorMsg += `- Expected messages: [${errorContentArray.map((msg) => `'${msg}'`).join(', ')}]\n`
                    errorMsg += `- Found messages: [${foundMessages.map((msg) => `'${msg}'`).join(', ')}]\n`
                    errorMsg += `- Partial XML: ${errorXml.substring(0, 500)}...`

                    assert(false, errorMsg)
                  }
                }

                // Additional validation for complete error message structure
                globalThis.testLogger.info('Validating error message in XML:', {
                  errorCodes: errorCodesArray,
                  errorMessages: errorContentArray,
                  xmlLength: errorXml.length,
                  foundCodes: errorCodesArray.filter((code) =>
                    errorXml.includes(code)
                  ),
                  foundMessages: errorContentArray.filter(
                    (message) =>
                      message && message !== '' && errorXml.includes(message)
                  )
                })
              }

              return errorXml
            })
        })
      },
      expectDecision: (expectedDecisionCode) =>
        this.sendClearanceRequest().then(() =>
          this.expectDecision(expectedDecisionCode)
        ),
      expectMultipleErrors: (errorValidations) =>
        this.sendClearanceRequest().then(() =>
          this.expectMultipleErrors(errorValidations)
        ),
      waitForDecision: (expectedDecisionCode) =>
        this.sendClearanceRequest().then(() =>
          this.waitForDecision(expectedDecisionCode)
        ),
      waitForCheckDecision: (expectedCheckCode, expectedDecisionCode) =>
        this.sendClearanceRequest().then(() =>
          this.waitForCheckDecision(expectedCheckCode, expectedDecisionCode)
        ),
      waitForCheckDecisionWithChedRef: (
        expectedCheckCode,
        expectedDecisionCode,
        expectedChedReference
      ) =>
        this.sendClearanceRequest().then(() =>
          this.waitForCheckDecisionWithChedRef(
            expectedCheckCode,
            expectedDecisionCode,
            expectedChedReference
          )
        ),
      waitForGmrCustomDeclaration: (expectedGmr, expectedMrn) =>
        this.sendClearanceRequest().then(() =>
          this.waitForGmrCustomDeclaration(expectedGmr, expectedMrn)
        ),
      waitForSpecificError: (expectedErrorCode) =>
        this.sendClearanceRequest().then(() =>
          this.builder.waitForSpecificError(expectedErrorCode)
        ),
      expectErrorAndWait: (expectedErrorPattern, expectedErrorCode) =>
        this.sendClearanceRequest().then(async () => {
          await this.expectErrorResponse(expectedErrorPattern)
          const errorXml =
            await this.builder.waitForSpecificError(expectedErrorCode)
          return { errorXml, expectedErrorPattern }
        }),
      waitForErrorInCDS: (expectedErrors, expectedErrorContent) =>
        this.sendClearanceRequest().then(async () => {
          // Handle both object format ({errorCode, errorMessage}) and legacy format (codes, content)
          let errorCodesArray = []
          let errorContentArray = []
          let errorObjects = null

          // Detect if this is the object format when called with only one parameter
          if (
            arguments.length === 1 &&
            Array.isArray(expectedErrors) &&
            expectedErrors.length > 0 &&
            typeof expectedErrors[0] === 'object' &&
            'errorCode' in expectedErrors[0]
          ) {
            // Direct object format: waitForErrorInCDS([{errorCode: 'ALVSVAL303', errorMessage: 'msg'}])
            errorObjects = expectedErrors
            errorCodesArray = expectedErrors
              .map((err) => err.errorCode)
              .filter((code) => code && code !== '')
            errorContentArray = expectedErrors
              .map((err) => err.errorMessage)
              .filter((msg) => msg && msg !== '')
          } else if (
            typeof expectedErrors === 'string' &&
            typeof expectedErrorContent === 'undefined'
          ) {
            // Legacy format: waitForErrorInCDS('ALVSVAL303')
            errorCodesArray = [expectedErrors]
            errorContentArray = []
          } else if (
            Array.isArray(expectedErrors) &&
            expectedErrors.length > 0 &&
            typeof expectedErrors[0] === 'object' &&
            'errorCode' in expectedErrors[0]
          ) {
            // Object format with legacy signature: waitForErrorInCDS([{errorCode: 'ALVSVAL320', errorMessage: 'msg'}], content)
            errorObjects = expectedErrors
            errorCodesArray = expectedErrors
              .map((err) => err.errorCode)
              .filter((code) => code && code !== '')
            errorContentArray = expectedErrors
              .map((err) => err.errorMessage)
              .filter((msg) => msg && msg !== '')
          } else {
            // Legacy format: waitForErrorInCDS('ALVSVAL320', 'message')
            errorCodesArray = Array.isArray(expectedErrors)
              ? expectedErrors
              : [expectedErrors]
            errorContentArray = expectedErrorContent
              ? Array.isArray(expectedErrorContent)
                ? expectedErrorContent
                : [expectedErrorContent]
              : []
          }

          if (errorCodesArray.length === 0) {
            throw new Error('At least one error code must be provided')
          }

          let errorXml = null
          // Wait for any of the specified error codes
          for (const errorCode of errorCodesArray) {
            try {
              errorXml = await this.builder.waitForSpecificError(errorCode)
              break // Found one, stop looking
            } catch (err) {
              // Continue to next error code if this one times out
              continue
            }
          }

          // Validate that we found any error code
          if (!errorXml) {
            throw new Error(
              `None of the expected error codes [${errorCodesArray.join(', ')}] were found in CDS notifications`
            )
          }

          // Validate error codes and messages if provided
          if (expectedErrors || expectedErrorContent) {
            const hasAnyErrorCode = errorCodesArray.some((code) =>
              errorXml.includes(code)
            )
            assert(
              hasAnyErrorCode,
              `Expected error XML to contain one of error codes [${errorCodesArray.join(', ')}]`
            )

            // Enhanced validation for object format: check specific code-message pairs
            if (errorObjects) {
              // Object format validation: check if XML contains any valid code-message pair
              const hasValidPair = errorObjects.some((errorObj) => {
                const hasCode = errorXml.includes(errorObj.errorCode)
                const hasMessage =
                  !errorObj.errorMessage ||
                  errorObj.errorMessage === '' ||
                  errorXml.includes(errorObj.errorMessage)
                return hasCode && hasMessage
              })

              if (!hasValidPair) {
                const foundCodes = errorCodesArray.filter((code) =>
                  errorXml.includes(code)
                )
                const foundMessages = errorContentArray.filter(
                  (msg) => msg && msg !== '' && errorXml.includes(msg)
                )

                let errorMsg = `Expected error XML to contain a valid error code-message pair.\n`
                errorMsg += `- Expected pairs: ${errorObjects.map((e) => `{code: '${e.errorCode}', message: '${e.errorMessage}'}`).join(', ')}\n`
                errorMsg += `- Found codes: [${foundCodes.join(', ')}]\n`
                errorMsg += `- Found messages: [${foundMessages.join(', ')}]\n`
                errorMsg += `- Partial XML: ${errorXml.substring(0, 500)}...`

                assert(false, errorMsg)
              }
            } else {
              // Legacy format validation: check both codes and any of the messages together
              const hasExpectedError = errorCodesArray.some((code) => {
                return (
                  errorXml.includes(code) &&
                  errorContentArray.some(
                    (errorMsg) => errorMsg === '' || errorXml.includes(errorMsg)
                  )
                )
              })

              if (!hasExpectedError) {
                const foundCodes = errorCodesArray.filter((code) =>
                  errorXml.includes(code)
                )
                const foundMessages = errorContentArray.filter(
                  (message) =>
                    message && message !== '' && errorXml.includes(message)
                )

                let errorMsg = `Expected error XML to contain at least one error code AND one error message.\n`
                errorMsg += `- Expected codes: [${errorCodesArray.join(', ')}]\n`
                errorMsg += `- Found codes: [${foundCodes.join(', ')}]\n`
                errorMsg += `- Expected messages: [${errorContentArray.map((msg) => `'${msg}'`).join(', ')}]\n`
                errorMsg += `- Found messages: [${foundMessages.map((msg) => `'${msg}'`).join(', ')}]\n`
                errorMsg += `- Partial XML: ${errorXml.substring(0, 500)}...`

                assert(false, errorMsg)
              }
            }

            // Additional validation for complete error message structure
            globalThis.testLogger.info('Validating error message in XML:', {
              errorCodes: errorCodesArray,
              errorMessages: errorContentArray,
              xmlLength: errorXml.length,
              foundCodes: errorCodesArray.filter((code) =>
                errorXml.includes(code)
              ),
              foundMessages: errorContentArray.filter((message) =>
                errorXml.includes(message)
              )
            })
          }

          return errorXml
        })
    }
  }

  async expectMultipleErrors(errorValidations) {
    const responseText = await waitForDataInAPI(this.builder.getMrn(), 'ERROR')
    const responseObj = JSON.parse(responseText)

    const notifications = responseObj.processingErrors
    assert(
      Array.isArray(notifications) && notifications.length > 0,
      'No notifications found'
    )

    const errors = notifications[0].errors
    assert(Array.isArray(errors), 'Errors field missing or not an array')

    function assertErrorWithParams(
      code,
      messageTemplate,
      params,
      customErrorMessage = null
    ) {
      const expectedSubstring = messageTemplate.replace(
        /\{(\w+)\}/g,
        (_, key) => {
          return params[key] !== undefined ? params[key] : `{${key}}`
        }
      )

      const found = errors.find(
        (e) => e.code === code && e.message.includes(expectedSubstring)
      )

      const defaultMessage = `Expected error with code ${code} and message containing '${expectedSubstring}'`
      const errorMessage = customErrorMessage || defaultMessage

      assert(found, errorMessage)
    }

    // Validate each error
    errorValidations.forEach((validation) => {
      assertErrorWithParams(
        validation.code,
        validation.messageTemplate,
        validation.params,
        validation.customErrorMessage
      )
    })

    return this
  }
}

export function newClearanceRequest() {
  return new FluentClearanceRequestTest()
}

// Fluent API for ALVS error notifications
export class FluentAlvsErrorTest {
  constructor() {
    this.builder = new SoapMessageBuilder('error')
    this.mrn = null
    this.sent = false
    this.overrides = {}
  }

  withEntryReference(entryReference) {
    this.mrn = entryReference
    this.overrides.EntryReference = entryReference
    return this
  }

  withErrorCode(errorCode) {
    this.overrides.ErrorCode = errorCode
    return this
  }

  withErrorMessage(errorMessage) {
    this.overrides.ErrorMessage = errorMessage
    return this
  }

  withCorrelationId(correlationId) {
    this.overrides.CorrelationId = correlationId
    return this
  }

  async sendErrorNotification() {
    if (this.sent) {
      throw new Error('Error notification already sent')
    }

    const soapEnvelope = this.builder.buildMessage(this.overrides)

    testLogger.info('Sending ALVS error notification')
    const response = await sendSoapRequest(
      SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT,
      soapEnvelope
    )
    this.sent = true

    return {
      response,
      expectErrorRecorded: (expectedErrorCode) =>
        this.expectErrorRecorded(expectedErrorCode),
      waitForErrorRecorded: (expectedErrorCode) =>
        this.waitForErrorRecorded(expectedErrorCode)
    }
  }

  async expectErrorRecorded(expectedErrorCode) {
    testLogger.info(
      `Waiting for error ${expectedErrorCode} to be recorded for MRN: ${this.mrn}`
    )
    const responseText = await waitForDataInAPI(this.mrn)

    if (!responseText.includes(expectedErrorCode)) {
      throw new Error(
        `Expected error code ${expectedErrorCode} not found in response: ${responseText}`
      )
    }

    testLogger.info(`✓ Error ${expectedErrorCode} successfully recorded`)
    return responseText
  }

  async waitForErrorRecorded(expectedErrorCode) {
    return this.expectErrorRecorded(expectedErrorCode)
  }

  getMrn() {
    return this.mrn
  }
}

// Fluent API for finalisation messages
export class FluentFinalisationTest {
  constructor() {
    this.builder = new SoapMessageBuilder('finalisation')
    this.mrn = null
    this.sent = false
  }

  withMRN(mrn) {
    this.mrn = mrn
    this.builder.withMRN(mrn)
    return this
  }

  withEntryVersionNumber(entryVersionNumber) {
    this._entryVersionNumber = entryVersionNumber
    return this
  }

  withFinalState(finalState) {
    this._finalState = finalState
    return this
  }

  withDecisionNumber(decisionNumber) {
    this._decisionNumber = decisionNumber
    return this
  }

  withManualAction(manualAction) {
    this._manualAction = manualAction
    return this
  }

  async sendFinalisation() {
    const soapEnvelope = this.builder.buildMessage({
      EntryReference: this.mrn,
      EntryVersionNumber: this._entryVersionNumber || 1,
      FinalState: this._finalState,
      DecisionNumber: this._decisionNumber,
      ManualAction: this._manualAction
    })

    testLogger.info(soapEnvelope)
    await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, soapEnvelope)
    this.sent = true
    return this
  }

  async expectFinalisationState(expectedState, stabilityDuration = 0) {
    if (!this.sent) {
      throw new Error(
        'Must call sendFinalisation() before expectFinalisationState()'
      )
    }

    if (stabilityDuration > 0) {
      return await waitForDataInAPIWithStability(
        this.mrn,
        '',
        {
          finalisation: { finalState: expectedState }
        },
        stabilityDuration
      )
    } else {
      return await waitForDataInAPI(this.mrn, '', {
        finalisation: { finalState: expectedState }
      })
    }
  }

  async expectJson(expectedProperties, stabilityDuration = 0) {
    if (!this.sent) {
      throw new Error('Must call sendFinalisation() before expectJson()')
    }

    if (stabilityDuration > 0) {
      return await waitForDataInAPIWithStability(
        this.mrn,
        '',
        expectedProperties,
        stabilityDuration
      )
    } else {
      return await waitForDataInAPI(this.mrn, '', expectedProperties)
    }
  }
}

export function newFinalisationRequest() {
  return new FluentFinalisationTest()
}

export function newAlvsErrorRequest() {
  return new FluentAlvsErrorTest()
}

// Standalone function for waiting for decisions
export async function waitForDecision(mrn, expectedDecisionCode) {
  return await globalThis.waitForSpecificDecision(mrn, expectedDecisionCode)
}

// Helper function for true fluent chaining with async methods
export async function executeClearanceRequestTest(testBuilder) {
  await testBuilder.sendClearanceRequest()
  return testBuilder
}

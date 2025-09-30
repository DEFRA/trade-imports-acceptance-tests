import { SoapMessageBuilder } from '#utils/soapMessageBuilder.js'
import { waitForDataInAPI } from '#utils/tradeimportsdatapiMessageHandler.js'

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

  getMrn() {
    return this.builder.getMrn()
  }

  // Fluent interface for async operations
  send() {
    return {
      send: () => this.sendClearanceRequest(),
      expectError: (expectedErrorPattern) =>
        this.sendClearanceRequest().then(() =>
          this.expectErrorResponse(expectedErrorPattern)
        ),
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
        )
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
  const decisionXml = await globalThis.waitForSpecificDecision(
    mrn,
    expectedDecisionCode
  )
  return decisionXml
}

// Helper function for true fluent chaining with async methods
export async function executeClearanceRequestTest(testBuilder) {
  await testBuilder.sendClearanceRequest()
  return testBuilder
}

import {
  newClearanceRequest,
  sendClearanceRequest,
  expectErrorResponse,
  newClearanceRequestTest,
  newFluentClearanceRequestTest,
  newFluentFinalisationTest,
  waitForDecision,
  executeClearanceRequestTest
} from '#steps/cds/inbound/clearanceRequest.js'

globalThis.newClearanceRequest = newClearanceRequest
globalThis.sendClearanceRequest = sendClearanceRequest
globalThis.expectErrorResponse = expectErrorResponse
globalThis.newClearanceRequestTest = newClearanceRequestTest
globalThis.newFluentClearanceRequestTest = newFluentClearanceRequestTest
globalThis.newFluentFinalisationTest = newFluentFinalisationTest
globalThis.waitForDecision = waitForDecision
globalThis.executeClearanceRequestTest = executeClearanceRequestTest

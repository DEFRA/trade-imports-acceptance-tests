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
import { waitForSpecificCheckDecision } from '#utils/waitForDecision.js'

globalThis.newClearanceRequest = newClearanceRequest
globalThis.sendClearanceRequest = sendClearanceRequest
globalThis.expectErrorResponse = expectErrorResponse
globalThis.newClearanceRequestTest = newClearanceRequestTest
globalThis.newFluentClearanceRequestTest = newFluentClearanceRequestTest
globalThis.newFluentFinalisationTest = newFluentFinalisationTest
globalThis.waitForDecision = waitForDecision
globalThis.waitForSpecificCheckDecision = waitForSpecificCheckDecision
globalThis.executeClearanceRequestTest = executeClearanceRequestTest

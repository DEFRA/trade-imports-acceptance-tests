import {
  newClearanceRequest,
  newFinalisationRequest,
  newAlvsErrorRequest,
  waitForDecision,
  executeClearanceRequestTest
} from '#steps/cds/inbound/clearanceRequest.js'
import {
  waitForSpecificCheckDecision,
  waitForSpecificCheckDecisionWithChedRef,
  waitForGmrDeclaration
} from '#utils/waitForDecision.js'

globalThis.newClearanceRequest = newClearanceRequest
globalThis.newFinalisationRequest = newFinalisationRequest
globalThis.newAlvsErrorRequest = newAlvsErrorRequest
globalThis.waitForDecision = waitForDecision
globalThis.waitForSpecificCheckDecision = waitForSpecificCheckDecision
globalThis.waitForSpecificCheckDecisionWithChedRef =
  waitForSpecificCheckDecisionWithChedRef
globalThis.executeClearanceRequestTest = executeClearanceRequestTest
globalThis.waitForGmrDeclaration = waitForGmrDeclaration

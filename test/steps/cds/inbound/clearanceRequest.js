import { SoapMessageBuilder } from '#utils/soapMessageBuilder.js'

export async function sendClearanceRequest(clearanceRequest) {
  globalThis.testLogger.info('Sending ClearanceRequest')
  thisStepStartTime = Date.now()
  await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, clearanceRequest)
}

export function newClearanceRequest() {
  return new SoapMessageBuilder()
}

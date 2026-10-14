import { waitForDataInAPI } from './tradeimportsdatapiMessageHandler.js'

// Asks trade-gateway-publisher to publish a CHED now, rather than waiting for its scheduled job to
// find the change. It takes the same route from there: trade-gateway, SNS, the processor, the Data API.
export async function tradeGatewayPublisherForceChedPublish(chedId) {
  const resp = await fetch(
    `${BASE_URL_TRADE_GATEWAY_PUBLISHER}/ched/${encodeURIComponent(chedId)}`
  )

  if (!resp.ok) {
    throw new Error(
      `Force publish of ${chedId} failed: HTTP ${resp.status} ${await resp.text()}`
    )
  }
}

// Forces a publish, then waits for the CHED in the Data API. Pass expectedProperties to wait for an
// update rather than just the CHED arriving, e.g. a new status:
//   { ched: { exchangedDocument: { documentStatusCode: '70' } } }
export async function forceSyncAndWaitForDataInAPI(
  chedId,
  expectedProperties = null
) {
  await tradeGatewayPublisherForceChedPublish(chedId)
  return waitForDataInAPI(chedId, 'TRACES', expectedProperties)
}

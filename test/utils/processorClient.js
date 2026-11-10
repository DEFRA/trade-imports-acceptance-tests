import { v4 as uuidv4 } from 'uuid'

const withProcessorHeaders = (headers) => ({
  Authorization: TRADE_IMPORTS_PROCESSOR_AUTHORIZATION_HEADER,
  'Content-Type': 'application/json',
  ...(CDP_API_KEY ? { 'X-API-Key': CDP_API_KEY } : {}),
  ...headers
})

const withDataApiHeaders = (headers) => ({
  Authorization: TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER,
  'Content-Type': 'application/json',
  ...(CDP_API_KEY ? { 'X-API-Key': CDP_API_KEY } : {}),
  ...headers
})

const makeRequest = async (fetchRequest) => {
  const resp = await fetchRequest
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
  return resp
}

export async function processorPostTracesChed(json, traceId) {
  const resolvedTraceId = traceId ?? uuidv4().replace(/-/g, '')

  const req = fetch(`${BASE_URL_TRADE_IMPORTS_PROCESSOR}/dev/traces-cheds`, {
    method: 'POST',
    body: JSON.stringify(json),
    headers: withProcessorHeaders({ 'x-cdp-request-id': resolvedTraceId })
  })

  const response = await makeRequest(req)
  return { traceId: resolvedTraceId, response }
}

export async function processorPostMatchedGmr(matchedGmr, traceId) {
  const resolvedTraceId = traceId ?? uuidv4().replace(/-/g, '')

  const req = fetch(`${BASE_URL_TRADE_IMPORTS_PROCESSOR}/dev/matched-gmrs`, {
    method: 'POST',
    body: JSON.stringify(matchedGmr),
    headers: withProcessorHeaders({ 'x-cdp-request-id': resolvedTraceId })
  })

  const response = await makeRequest(req)
  return { traceId: resolvedTraceId, response }
}

export async function dataApiPutChedReservation(chedId, mrn, reservation) {
  const req = fetch(
    `${BASE_URL_TRADE_IMPORTS_DATA_API}/traces-cheds/${chedId}/reservation/${mrn}/`,
    {
      method: 'PUT',
      body: JSON.stringify(reservation),
      headers: withDataApiHeaders()
    }
  )

  const response = await makeRequest(req)
  return { response }
}

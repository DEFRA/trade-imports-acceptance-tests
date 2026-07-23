const withHeaders = (headers) => ({
  Authorization: TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER,
  'Content-Type': 'application/json',
  'X-API-Key': CDP_API_KEY,
  ...headers
})

const makeRequest = async (fetchRequest) => {
  const resp = await fetchRequest
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
  return resp
}

export async function dataApiClientRequest(url, params) {
  const req = fetch(url, {
    ...params,
    headers: withHeaders(params.headers)
  })

  return makeRequest(req)
}

export async function dataApiClientGetMaxId() {
  const req = fetch(`${BASE_URL_TRADE_IMPORTS_DATA_API}/admin/max-id`, {
    method: 'GET',
    headers: withHeaders()
  })

  return makeRequest(req)
}

export async function dataApiClientGetTracesChed(documentReference) {
  const req = await fetch(
    `${BASE_URL_TRADE_IMPORTS_DATA_API}/traces-cheds/${documentReference}/`,
    {
      method: 'GET',
      headers: withHeaders()
    }
  )

  return makeRequest(req)
}

export async function dataApiClientPutTracesChed(
  documentReference,
  body,
  etag = null
) {
  const req = await fetch(
    `${BASE_URL_TRADE_IMPORTS_DATA_API}/traces-cheds/${documentReference}/`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: withHeaders(etag != null ? { 'If-Match': etag } : null)
    }
  )

  return makeRequest(req)
}

import { request } from 'undici'

const encodedAuth = Buffer.from(
  `${process.env.REPORTING_USERNAME}:${process.env.REPORTING_PASSWORD}`
).toString('base64')

export async function getClearanceRequestSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/clearance-requests/summary?from=${from}&to=${to}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getClearanceRequestBucket(from, to, unit) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/clearance-requests/buckets?from=${from}&to=${to}&unit=${unit}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getNotificationSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/notifications/summary?from=${from}&to=${to}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getNotificationBucket(from, to, unit) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/notifications/buckets?from=${from}&to=${to}&unit=${unit}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getMatchesSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/summary?from=${from}&to=${to}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getMatchesBucket(from, to, unit) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/buckets?from=${from}&to=${to}&unit=${unit}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getReleasesSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/releases/summary?from=${from}&to=${to}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getReleaseBucket(from, to, unit) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/releases/buckets?from=${from}&to=${to}&unit=${unit}`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function getLastReceived(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/last-received`

  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json'
    }
  })

  if (statusCode !== 200) {
    throw new Error(`Request failed with status ${statusCode}`)
  }

  return body.json()
}

export async function pollForExpectedValue(
  fetchFn,
  extractFn,
  expectedValue,
  retries = 10,
  interval = 2000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const result = await fetchFn()
    const actual = extractFn(result)

    if (actual === expectedValue) {
      testLogger.info('Polling [FOUND]: ', {
        actual,
        expectedValue,
        attempt
      })
      return actual
    }

    if (attempt <= retries) {
      testLogger.info('Polling [NOT FOUND]: ', {
        actual,
        expectedValue,
        attempt
      })
      // eslint-disable-next-line promise/param-names
      await new Promise((res) => setTimeout(res, interval))
    }
  }

  throw new Error(
    `Expected value ${expectedValue} not found after ${retries} attempts`
  )
}

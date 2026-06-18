import { request } from 'undici'

const encodedAuth = Buffer.from(
  `${process.env.REPORTING_USERNAME}:${process.env.REPORTING_PASSWORD}`
).toString('base64')

export async function getClearanceRequestSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/clearance-requests/summary?from=${from}&to=${to}`
  return await makeGetRequest(url)
}

export async function getClearanceRequestInterval(from, to, interval) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/clearance-requests/intervals?from=${from}&to=${to}&intervals=${interval}`
  return await makeGetRequest(url)
}

export async function getNotificationSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/notifications/summary?from=${from}&to=${to}`
  return await makeGetRequest(url)
}

export async function getNotificationInterval(from, to, interval) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/notifications/intervals?from=${from}&to=${to}&intervals=${interval}`
  return await makeGetRequest(url)
}

export async function getMatchesSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/summary?from=${from}&to=${to}`
  return await makeGetRequest(url)
}

export async function getMatchesInterval(from, to, interval) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/intervals?from=${from}&to=${to}&intervals=${interval}`
  return await makeGetRequest(url)
}

export async function getReleasesSummary(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/releases/summary?from=${from}&to=${to}`
  return await makeGetRequest(url)
}

export async function getReleasesInterval(from, to, interval) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/releases/intervals?from=${from}&to=${to}&intervals=${interval}`
  return await makeGetRequest(url)
}

export async function getLastReceived(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/last-received`
  return await makeGetRequest(url)
}

export async function getLastCreated() {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/last-created`
  return await makeGetRequest(url)
}

export async function getLastSent() {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/last-sent`
  return await makeGetRequest(url)
}

export async function getStatus() {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/status`
  return await makeGetRequest(url)
}

export async function getMatchingLevels(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/summary/levels?from=${from}&to=${to}`
  return await makeGetRequest(url)
}

export async function getMatchingLevelsByRegion(from, to) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/summary/levels-by-region?from=${from}&to=${to}`
  return await makeGetRequest(url)
}

export async function getDataMatches(from, to, useV2 = false, match = false) {
  const url = `${BASE_URL_TRADE_IMPORTS_REPORTING}/matches/data?from=${from}&to=${to}&match=${match}`
  const headers = useV2 ? { useV2: 'true' } : {}
  return await makeGetRequest(url, headers)
}

export async function waitForLevelsChange(
  initialLevels,
  getLevelsFn,
  timeoutMs = 10000,
  intervalMs = 250
) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const current = await getLevelsFn()
    if (
      current.level1 !== initialLevels.level1 ||
      current.level2 !== initialLevels.level2 ||
      current.level3 !== initialLevels.level3 ||
      current.total !== initialLevels.total
    ) {
      return current
    }
    // eslint-disable-next-line promise/param-names
    await new Promise((res) => setTimeout(res, intervalMs))
  }
  throw new Error('Timeout: No level changed within the timeout period')
}

function extractRegionLevelSnapshot(levels) {
  return {
    total: levels?.total,
    euTotal: levels?.eu?.total,
    euMatchTotal: levels?.eu?.match?.total,
    euMatchLevel1: levels?.eu?.match?.level1,
    euMatchLevel2: levels?.eu?.match?.level2,
    euMatchLevel3: levels?.eu?.match?.level3,
    euNoMatchTotal: levels?.eu?.noMatch?.total,
    euNoMatchLevel1: levels?.eu?.noMatch?.level1,
    euNoMatchLevel2: levels?.eu?.noMatch?.level2,
    euNoMatchLevel3: levels?.eu?.noMatch?.level3,
    rowTotal: levels?.row?.total,
    rowMatchTotal: levels?.row?.match?.total,
    rowMatchLevel1: levels?.row?.match?.level1,
    rowMatchLevel2: levels?.row?.match?.level2,
    rowMatchLevel3: levels?.row?.match?.level3,
    rowNoMatchTotal: levels?.row?.noMatch?.total,
    rowNoMatchLevel1: levels?.row?.noMatch?.level1,
    rowNoMatchLevel2: levels?.row?.noMatch?.level2,
    rowNoMatchLevel3: levels?.row?.noMatch?.level3
  }
}

function hasRegionLevelsChanged(initialLevels, currentLevels) {
  const initialSnapshot = extractRegionLevelSnapshot(initialLevels)
  const currentSnapshot = extractRegionLevelSnapshot(currentLevels)

  return Object.keys(initialSnapshot).some(
    (key) => currentSnapshot[key] !== initialSnapshot[key]
  )
}

export async function waitForLevelsByRegionChange(
  initialLevels,
  getLevelsFn,
  timeoutMs = 10000,
  intervalMs = 250
) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const current = await getLevelsFn()
    if (hasRegionLevelsChanged(initialLevels, current)) {
      return current
    }
    // eslint-disable-next-line promise/param-names
    await new Promise((res) => setTimeout(res, intervalMs))
  }

  throw new Error('Timeout: No region level changed within the timeout period')
}

async function makeGetRequest(url, additionalHeaders = {}) {
  const { statusCode, body } = await request(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      Accept: 'application/json',
      ...additionalHeaders
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

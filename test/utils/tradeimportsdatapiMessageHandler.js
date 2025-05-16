import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'

export async function waitForDataInAPI(
  key,
  collection,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  let url = ''
  if (collection === 'IPAFFS') {
    url = `${BASE_URL_TRADE_IMPORTS_DATA_API}/import-pre-notifications/${key}`
  } else if (collection === 'ERROR') {
    url = `${BASE_URL_TRADE_IMPORTS_DATA_API}/processing-errors/${key}`
  } else {
    url = `${BASE_URL_TRADE_IMPORTS_DATA_API}/customs-declarations/${key}`
  }

  let lastResponse = null
  let lastResponseText = ''
  let lastError = null

  try {
    await pWaitFor(
      async () => {
        try {
          console.log(`Polling: ${url}`)

          const resp = await request(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic VHJhZGVJbXBvcnRzUHJvY2Vzc29yOnk3MFUwVXZYUnlHMTRmODQ=`
            }
          })

          lastResponseText = await resp.body.text()
          console.log(lastResponseText)
          lastResponse = resp

          if (resp.statusCode !== 200) {
            lastError = new Error(`Unexpected status code: ${resp.statusCode}`)
            return false
          }

          console.log(`api response found: ${lastResponseText}`)
          return true
        } catch (err) {
          console.error('Error during request:', err)
          return false
        }
      },
      { interval, timeout }
    )

    return lastResponseText
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.error('Timed out polling for MRN:', key)
      if (lastError) {
        console.error('Last error:', lastError.message || lastError)
      } else {
        console.error('Last response status code:', lastResponse.statusCode)
        console.error('Last response headers:', lastResponse.headers)
        console.error('Last response text:', lastResponseText)
      }

      throw new Error(`Polling api timed out for key: ${key}`)
    }
    throw err
  }
}

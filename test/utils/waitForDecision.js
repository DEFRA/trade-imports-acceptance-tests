import { request } from 'undici'
import pWaitFor from 'p-wait-for'
import { TimeoutError } from 'p-timeout'

export async function waitForDecision(
  mrn,
  afterTimestamp,
  timeout = TIMEOUT_MS,
  interval = POLL_INTERVAL_MS
) {
  const url = `${BASE_URL_TRADE_IMPORTS_DECISION_COMPARER}/decisions/${mrn}`

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
              Authorization: COMPARER_AUTHORIZATION_HEADER
            }
          })

          lastResponseText = await resp.body.text()
          lastResponse = resp

          if (resp.statusCode !== 200) {
            lastError = new Error(`Unexpected status code: ${resp.statusCode}`)
            return false
          }

          const data = JSON.parse(lastResponseText)

          if (
            !data.btmsDecision ||
            !Array.isArray(data.btmsDecision.decisions)
          ) {
            return false
          }

          const startTime = new Date(afterTimestamp)

          const newDecisions = data.btmsDecision.decisions
            .filter((decision) => new Date(decision.created) > startTime)
            .sort((a, b) => new Date(b.created) - new Date(a.created))

          if (newDecisions.length === 0) {
            return false
          }

          console.log(
            `Latest decision message found: ${newDecisions[0].created}`
          )
          lastResponseText = newDecisions[0].xml // Returning the latest
          return true
          // TODO: stop using magic string and make this check more robust
          // needs to identify that a NEW decision is available
          // return lastResponseText.includes('"btmsDecision":{"id":"25')
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
      console.error('Timed out polling for MRN:', mrn)
      if (lastError) {
        console.error('Last error:', lastError.message || lastError)
      } else {
        console.error('Last response status code:', lastResponse.statusCode)
        console.error('Last response headers:', lastResponse.headers)
        console.error('Last response text:', lastResponseText)
      }

      throw new Error(`Polling for decision timed out for MRN: ${mrn}`)
    }
    throw err
  }
}

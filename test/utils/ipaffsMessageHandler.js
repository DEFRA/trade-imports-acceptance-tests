import { request } from 'undici'
import crypto from 'crypto'

export async function sendIpaffsMessage(json) {
  const url = `https://devtreinfsb1001.servicebus.windows.net/defra.trade.imports.notification-topic/messages`

  const accessToken = createSharedAccessToken(
    'https://devtreinfsb1001.servicebus.windows.net/defra.trade.imports.notification-topic',
    'trade-imports',
    IPAFFS_KEY
  )

  const body = typeof json === 'object' ? JSON.stringify(json) : json
  console.log(body)

  let bodyText

  try {
    const response = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        Authorization: accessToken
      },
      body
    })

    if (response.statusCode !== 200) {
      bodyText = await response.body.text()
      throw new Error(
        `ASB returned status ${response.statusCode}: ${bodyText} : ${JSON.stringify(response.headers)}`
      )
    }

    console.log(bodyText)
    return response
  } catch (err) {
    console.error('Request URL:', url)
    console.error('Request Body:', json)
    console.error('Error:', err.message || err)
    throw new Error(`request failed: ${err.message || err}`)
  }
}

function createSharedAccessToken(uri, saName, saKey) {
  if (!uri || !saName || !saKey) {
    throw new Error('Missing required parameter')
  }

  const encodedUri = encodeURIComponent(uri)
  const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  const stringToSign = `${encodedUri}\n${ttl}`
  const hmac = crypto.createHmac('sha256', saKey)
  hmac.update(stringToSign)
  const signature = encodeURIComponent(hmac.digest('base64'))

  return `SharedAccessSignature sr=${encodedUri}&sig=${signature}&se=${ttl}&skn=${saName}`
}

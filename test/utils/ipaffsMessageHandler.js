import { request, ProxyAgent } from 'undici'

export async function sendIpaffsMessage(json) {
  const url = IPAFFS_PATH
  const body = typeof json === 'object' ? JSON.stringify(json) : json

  globalThis.testLogger.info({ message: 'Sending IPAFFS message', body })

  try {
    const response = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        Authorization: IPAFFS_SAS_TOKEN
      },
      body,
      ...(proxy && { dispatcher: new ProxyAgent({ uri: proxy }) })
    })

    if (response.statusCode !== 201) {
      const bodyText = await response.body.text()
      globalThis.testLogger.error(
        {
          statusCode: response.statusCode,
          responseBody: bodyText,
          headers: response.headers
        },
        'ASB returned error status'
      )
      throw new Error(
        `ASB returned status ${response.statusCode}: ${bodyText} : ${JSON.stringify(response.headers)}`
      )
    }

    globalThis.testLogger.info('Message sent successfully', {
      statusCode: response.statusCode
    })
    return response
  } catch (err) {
    globalThis.testLogger.error(
      { url, requestBody: body, err: err.message || err },
      'Request failed'
    )
    throw new Error(`Request failed: ${err.message || err}`)
  }
}

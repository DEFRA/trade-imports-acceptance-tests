import { request } from 'undici'

export async function sendSoapRequest(endpoint, soapEnvelope) {
  const url = `${BASE_URL_BTMS_GATEWAY}/ITSW/CDS/${endpoint}`

  try {
    const response = await request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: soapEnvelope
    })

    if (response.statusCode !== 200) {
      const bodyText = await response.body.text()
      throw new Error(
        `BTMS Gateway returned status ${response.statusCode}: ${bodyText}`
      )
    }

    await response.body.text()
    return response
  } catch (err) {
    console.error('Request URL:', url)
    console.error('Request Body:', soapEnvelope)
    console.error('Error:', err.message || err)
    throw new Error(`SOAP request failed: ${err.message || err}`)
  }
}

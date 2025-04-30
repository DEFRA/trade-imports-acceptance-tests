import { request } from 'undici'
import { BASE_URL_BTMS_GATEWAY } from '../config.js'

export async function sendSoapRequest(soapEnvelope) {
  const url = `${BASE_URL_BTMS_GATEWAY}/ITSW/CDS/SubmitImportDocumentCDSFacadeService`

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

    return response
  } catch (err) {
    console.error('Request URL:', url)
    console.error('Request Body:', soapEnvelope)
    console.error('Error:', err.message || err)
    throw new Error(`SOAP request failed: ${err.message || err}`)
  }
}

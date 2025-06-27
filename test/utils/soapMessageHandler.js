import { request } from 'undici'

const BASE_URL_BTMS_GATEWAY = `https://btms-gateway.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`

export async function sendSoapRequest(endpoint, soapEnvelope) {
  const url = `${BASE_URL_BTMS_GATEWAY}/ITSW/CDS/${endpoint}`

  globalThis.testLogger.info({ msg: 'SOAP message', url })
  globalThis.testLogger.info({ msg: 'SOAP message', soapEnvelope })

  try {
    const response = await request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: soapEnvelope
    })

    globalThis.testLogger.info({ statusCode: response.statusCode })

    return response
  } catch (e) {
    globalThis.testLogger.error('Request URL:', url)
    globalThis.testLogger.error('Request Body:', soapEnvelope)
    globalThis.testLogger.error('Error:', e.message || e)
    throw new Error(`sendSoapRequest request failed: ${e.message || e}`)
  }
}

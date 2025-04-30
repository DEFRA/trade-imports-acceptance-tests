import { request } from 'undici';
import { BASE_URL_BTMS_GATEWAY } from '../config.js';

export async function sendSoapRequest(soapEnvelope) {
    console.log(BASE_URL_BTMS_GATEWAY);
    const response = await request(`${BASE_URL_BTMS_GATEWAY}/ITSW/CDS/SubmitImportDocumentCDSFacadeService`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: soapEnvelope,
    });
    console.log(response);
    return response;
}
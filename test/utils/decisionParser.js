import { XMLParser } from 'fast-xml-parser';

export function parseDecision(responseText) {
    const jsonResponse = JSON.parse(responseText);
    const latestDecision = jsonResponse.btmsDecision?.decisions?.[0];
    const soapXml = latestDecision?.xml;

    if (!soapXml) {
        throw new Error('No  soap :(');
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(soapXml);

    // TODO: just get first item for now
    const item = parsed['soap:Envelope']?.['soap:Body']?.DecisionNotification?.DecisionNotification?.Item;
    const firstItem = Array.isArray(item) ? item[0] : item;
    return firstItem?.Check?.DecisionCode;
}
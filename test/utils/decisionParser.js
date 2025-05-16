import { XMLParser } from 'fast-xml-parser'

export function parseDecision(responseText) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: false
  })
  const parsed = parser.parse(responseText)

  // TODO: just get first item for now
  const item =
    parsed['soap:Envelope']?.['soap:Body']?.DecisionNotification
      ?.DecisionNotification?.Item
  const firstItem = Array.isArray(item) ? item[0] : item
  return firstItem?.Check?.DecisionCode
}

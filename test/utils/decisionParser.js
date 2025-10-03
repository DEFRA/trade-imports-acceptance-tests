import {
  createXmlParser,
  stripPrefixes,
  decodeHtmlEntities
} from './xmlUtils.js'

export function extractDecisionCodes(xmlString) {
  const parser = createXmlParser()
  const parsed = parser.parse(xmlString)

  // Try the new structure first: NS1:Envelope > NS1:Body > NS3:DecisionNotification > NS2:DecisionNotification
  let decisionNotification =
    parsed['NS1:Envelope']?.['NS1:Body']?.['NS3:DecisionNotification']?.[
      'NS2:DecisionNotification'
    ]

  // If not found, try the old structure with encoded XML
  if (!decisionNotification) {
    const innerEncodedXml =
      parsed['NS1:Envelope']?.['NS1:Body']?.['NS3:DecisionNotification']?.[
        '#text'
      ]
    if (!innerEncodedXml) return []

    const decodedXmlString = decodeHtmlEntities(innerEncodedXml)

    const innerParser = createXmlParser(false)
    const innerParsedRaw = innerParser.parse(decodedXmlString)
    decisionNotification = innerParsedRaw
  }

  // Strip prefixes from decisionNotification regardless of which path was taken
  decisionNotification = stripPrefixes(decisionNotification, 'NS2:')

  const items =
    decisionNotification?.DecisionNotification?.Item ||
    decisionNotification?.Item
  if (!items) return []

  const itemList = Array.isArray(items) ? items : [items]

  return itemList
    .map((item) => {
      // Handle case where Check is an array of check objects
      if (Array.isArray(item?.Check)) {
        return item.Check.map((check) => ({
          checkCode: check.CheckCode,
          decisionCode: check.DecisionCode
        })).filter((check) => check.checkCode && check.decisionCode)
      } else {
        // Handle case where Check is a single object
        const check = item?.Check
        if (check?.CheckCode && check?.DecisionCode) {
          return {
            checkCode: check.CheckCode,
            decisionCode: check.DecisionCode
          }
        }
        return null
      }
    })
    .flat()
    .filter(Boolean)
}

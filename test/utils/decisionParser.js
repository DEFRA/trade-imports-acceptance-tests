import { XMLParser } from "fast-xml-parser";

function stripPrefixes(obj, prefix = 'NS2:') {
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) {
    return obj.map((item) => stripPrefixes(item, prefix))
  }
  const newObj = {}
  for (const [key, val] of Object.entries(obj)) {
    const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key
    newObj[newKey] = stripPrefixes(val, prefix)
  }
  return newObj
}

export function extractDecisionCodes(xmlString) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    ignoreDeclaration: true,
    parseTagValue: false
  })

  const outerParsed = parser.parse(xmlString)

  const innerEncodedXml =
    outerParsed['NS1:Envelope']?.['NS1:Body']?.['NS3:DecisionNotification']?.[
      '#text'
    ]
  if (!innerEncodedXml) return []

  const decodeHtmlEntities = (str) =>
    str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')

  const decodedXmlString = decodeHtmlEntities(innerEncodedXml)

  const innerParser = new XMLParser({
    ignoreAttributes: false,
    ignoreDeclaration: true,
    parseTagValue: false,
    ignoreNameSpace: false
  })

  const innerParsedRaw = innerParser.parse(decodedXmlString)

  const innerParsed = stripPrefixes(innerParsedRaw, 'NS2:')

  const items = innerParsed?.DecisionNotification?.Item
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

import {
  createXmlParser,
  stripPrefixes,
  decodeHtmlEntities
} from './xmlUtils.js'

export function extractErrorCodes(xmlString) {
  const parser = createXmlParser()
  const parsed = parser.parse(xmlString)

  // Try the structure: NS1:Envelope > NS1:Body > NS3:HMRCErrorNotification > NS2:HMRCErrorNotification
  let errorNotification =
    parsed['NS1:Envelope']?.['NS1:Body']?.['NS3:HMRCErrorNotification']?.[
      'NS2:HMRCErrorNotification'
    ]

  // If not found, try the old structure with encoded XML
  if (!errorNotification) {
    const innerEncodedXml =
      parsed['NS1:Envelope']?.['NS1:Body']?.['NS3:HMRCErrorNotification']?.[
        '#text'
      ]
    if (!innerEncodedXml) return []

    const decodedXmlString = decodeHtmlEntities(innerEncodedXml)

    // Create parser with namespace handling disabled for inner XML
    const innerParser = createXmlParser(false)
    const innerParsedRaw = innerParser.parse(decodedXmlString)
    errorNotification = innerParsedRaw
  }

  // Strip prefixes from errorNotification regardless of which path was taken
  errorNotification = stripPrefixes(errorNotification, 'NS2:')

  const errors = errorNotification?.Error || []
  if (!errors) return []

  const errorList = Array.isArray(errors) ? errors : [errors]

  return errorList
    .map((error) => {
      if (error?.ErrorCode) {
        return {
          errorCode: error.ErrorCode,
          errorMessage: error.ErrorMessage
        }
      }
      return null
    })
    .filter(Boolean)
}

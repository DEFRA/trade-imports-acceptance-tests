import { XMLParser } from 'fast-xml-parser'

/**
 * Recursively removes namespace prefixes from object keys
 * @param {Object} obj - The object to process
 * @param {string} prefix - The prefix to remove (default: 'NS2:')
 * @returns {Object} - Object with prefixes stripped
 */
export function stripPrefixes(obj, prefix = 'NS2:') {
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

/**
 * Creates an XML parser with common configuration
 * @param {boolean} ignoreNameSpace - Whether to ignore namespace prefixes (default: true)
 * @returns {XMLParser} - Configured XML parser instance
 */
export function createXmlParser(ignoreNameSpace = true) {
  return new XMLParser({
    ignoreAttributes: false,
    ignoreDeclaration: true,
    parseTagValue: false,
    ignoreNameSpace
  })
}

/**
 * Decodes HTML entities in XML strings
 * @param {string} str - String with HTML entities
 * @returns {string} - Decoded string
 */
export function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

import crypto from 'crypto'

export function parseAsbConnectionString(str) {
  const map = {}
  str.split(';').forEach((segment) => {
    const idx = segment.indexOf('=')
    if (idx <= 0) return
    const key = segment.substring(0, idx).trim()
    const value = segment.substring(idx + 1)
    map[key] = value
  })
  if (map.Endpoint) {
    map.Endpoint = map.Endpoint.replace(/^sb:\/\//, '').replace(/\/$/, '')
  }
  if (map.EntityPath) {
    map.EntityPath = map.EntityPath.replace(/^\/|\/$/g, '')
  }
  return map
}

export function getAsbResourceUri(connectionString) {
  const { Endpoint, EntityPath } = parseAsbConnectionString(connectionString)
  return `https://${Endpoint}/${EntityPath}`
}

export function createAsbSasToken(connectionString, ttlSeconds = 43200) {
  const { SharedAccessKeyName: keyName, SharedAccessKey: key } =
    parseAsbConnectionString(connectionString)
  const resourceUri = getAsbResourceUri(connectionString)
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds
  const encodedUri = encodeURIComponent(resourceUri)
  const stringToSign = `${encodedUri}\n${expiry}`
  const signature = encodeURIComponent(
    crypto
      .createHmac('sha256', Buffer.from(key, 'utf8'))
      .update(stringToSign, 'utf8')
      .digest('base64')
  )
  return `SharedAccessSignature sr=${encodedUri}&sig=${signature}&se=${expiry}&skn=${keyName}`
}

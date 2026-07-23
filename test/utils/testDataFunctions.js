export function generateRandomMRN(prefix = '25GB') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = prefix
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  globalThis.testLogger.info(`Generate new MRN`, { mrn: result })
  return result
}

export function generateRandomGMR(prefix = 'GMRA') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = prefix
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  globalThis.testLogger.info(`Generate new GMR`, { gmr: result })
  return result
}

export async function generateDocumentReference({
  letter = 'A',
  prefixLength = 4,
  increment = 1
} = {}) {
  const randomNumberString = (length) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')

  const prefix = randomNumberString(prefixLength)
  const resp = await dataApiClientGetMaxId()

  const data = await resp.json()
  let baseNumber = 1000000

  if (typeof data.importPreNotification === 'string') {
    const match = data.importPreNotification.match(/(\d{7})(?:[A-Z])?$/i)
    if (match) {
      baseNumber = Number(match[1])
    }
  }

  const suffix = String(baseNumber + increment).padStart(7, '0')
  const result = `CHED${letter}.GB.${prefix}.${suffix}`

  globalThis.testLogger.info(`Generated new CHED reference`, { ched: result })
  return result
}

function merge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object
    ) {
      merge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

export function loadIPAFFSJson(filename, overrides = {}) {
  const filePath = path.join(globalThis.__dirname, 'test-data', filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(content)

  const { partTwo, ...rest } = overrides
  Object.assign(json, rest)

  if (partTwo !== undefined) {
    if (!json.partTwo) json.partTwo = {}
    merge(json.partTwo, partTwo)
  }

  return json
}

export function loadTRACESChed(filename, override = (content) => content) {
  const filePath = path.join(globalThis.__dirname, 'test-data', filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(content)

  return override(json)
}

export function loadGmrJson(filename, overrides = {}) {
  const filePath = path.join(globalThis.__dirname, 'test-data', filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(content)

  const { ...rest } = overrides
  Object.assign(json, rest)

  return json
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

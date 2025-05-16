export function generateRandomMRN(prefix = '25GB') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = prefix
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  console.log(result)
  return result
}

export function generateDocumentReference({
  letter = 'A',
  prefixLength = 4,
  suffixLength = 7
} = {}) {
  const randomNumberString = (length) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')

  const prefix = randomNumberString(prefixLength)
  const suffix = randomNumberString(suffixLength)

  return `CHED${letter}.GB.${prefix}.${suffix}`
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

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

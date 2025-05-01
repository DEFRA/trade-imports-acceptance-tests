require('dotenv').config({ path: './.env', override: true })

const required = {
  ENVIRONMENT: {},
  TRADE_IMPORTS_DECISION_COMPARER_USER: {},
  TRADE_IMPORTS_DECISION_COMPARER_KEY: {},
  POLL_INTERVAL_MS: { parseAs: 'int', default: 500 },
  TIMEOUT_MS: { parseAs: 'int', default: 30000 }
}

for (const [key, opts] of Object.entries(required)) {
  let val = process.env[key]
  if (opts.default && !val) {
    process.env[key] = String(opts.default)
    val = process.env[key]
  }
  if (!val) {
    throw new Error(`Missing required env var ${key}: ${opts.errorMsg || ''}`)
  }
  if (opts.allowed && !opts.allowed.includes(val)) {
    throw new Error(
      `Invalid ${key}="${val}". Expected one of ${opts.allowed.join(', ')}`
    )
  }
  if (opts.parseAs === 'int' && Number.isNaN(Number(val))) {
    throw new Error(`Invalid ${key}="${val}". Must be an integer.`)
  }
}

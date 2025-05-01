export const BASE_URL_BTMS_GATEWAY = `https://btms-gateway.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
export const BASE_URL_TRADE_IMPORTS_DECISION_COMPARER = `https://trade-imports-decision-comparer.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
export const TRADE_IMPORTS_DECISION_COMPARER_USER =
  process.env.TRADE_IMPORTS_DECISION_COMPARER_USER
export const TRADE_IMPORTS_DECISION_COMPARER_KEY =
  process.env.TRADE_IMPORTS_DECISION_COMPARER_KEY
export const AUTHORIZATION_HEADER =
  'Basic ' +
  Buffer.from(
    `${TRADE_IMPORTS_DECISION_COMPARER_USER}:${TRADE_IMPORTS_DECISION_COMPARER_KEY}`
  ).toString('base64')
export const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS)
export const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS)

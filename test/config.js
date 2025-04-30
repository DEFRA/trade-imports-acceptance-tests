export const BASE_URL_BTMS_GATEWAY = `https://btms-gateway.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
export const BASE_URL_TRADE_IMPORTS_DECISION_COMPARER = `https://trade-imports-decision-comparer.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
export const TRADE_IMPORTS_DECISION_COMPARER_USER = process.env.TRADEIMPORTSDECISIONCOMPARERUSER;
export const TRADE_IMPORTS_DECISION_COMPARER_KEY = process.env.TRADEIMPORTSDECISIONCOMPARERKEY;
export  const AUTHORIZATION_HEADER = 'Basic ' + Buffer.from(`${TRADE_IMPORTS_DECISION_COMPARER_USER}:${TRADE_IMPORTS_DECISION_COMPARER_KEY}`).toString('base64');

module.exports = {
  env: {
    es2022: true,
    node: true,
    jest: true
  },
  globals: {
    before: true,
    after: true
  },
  extends: [
    'standard',
    'prettier',
    'eslint:recommended',
    'plugin:wdio/recommended'
  ],
  overrides: [
    {
      "files": ["test/**/*.js"],
      "rules": {
        "no-console": "off"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  plugins: ['prettier', 'wdio', 'no-only-tests'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error',
    'no-only-tests/no-only-tests': 'error'
  },
    globals: {
assert: 'readonly',
step: 'readonly',
mochaStep: 'readonly',
allure: 'readonly',
sleep: 'readonly',
waitForDataInAPI: 'readonly',
waitForDecision: 'readonly',
SUBMIT_CLEARANCE_REQUEST_ENDPOINT: 'readonly',
SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT: 'readonly',
SUBMIT_FINALSIATION_ENDPOINT: 'readonly',
BASE_URL_BTMS_GATEWAY: 'readonly',
BASE_URL_TRADE_IMPORTS_DATA_API: 'readonly',
BASE_URL_TRADE_IMPORTS_DECISION_COMPARER: 'readonly',
TRADE_IMPORTS_DATA_API_USER: 'readonly',
TRADE_IMPORTS_DATA_API_KEY: 'readonly',
TRADE_IMPORTS_DECISION_COMPARER_USER: 'readonly',
TRADE_IMPORTS_DECISION_COMPARER_KEY: 'readonly',
COMPARER_AUTHORIZATION_HEADER: 'readonly',
DATAAPI_AUTHORIZATION_HEADER: 'readonly',
IPAFFS_KEY: 'readonly',
TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER: 'readonly',
SoapMessageBuilder: 'readonly',
sendSoapRequest: 'readonly',
generateRandomMRN: 'readonly',
generateDocumentReference: 'readonly',
sendIpaffsMessage: 'readonly',
loadIPAFFSJson: 'readonly',
parseDecision: 'readonly',
POLL_INTERVAL_MS: 'readonly',
TIMEOUT_MS: 'readonly',
lastStartTime: 'writable',
path: 'readonly',
fs: 'readonly',
__filename: 'readonly',
__dirname: 'readonly',
fileURLToPath: 'readonly'
  }
}

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
  plugins: ['prettier', 'wdio'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error'
  },
    globals: {
    step: 'readonly',
    generateRandomMRN: 'readonly',
    SoapMessageBuilder: 'readonly',
    sendSoapRequest: 'readonly',
    SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT: 'readonly',
    waitForDataInAPI: 'readonly',
    generateDocumentReference: 'readonly',
    sendIpaffsMessage: 'readonly',
    loadIPAFFSJson: 'readonly',
    SUBMIT_CLEARANCE_REQUEST_ENDPOINT: 'readonly',
    waitForDecision: 'readonly',
    lastStartTime: 'writable',
    parseDecision: 'readonly',
    assert: 'readonly',
    sleep: 'readonly',
    SUBMIT_FINALSIATION_ENDPOINT: 'readonly',
    TRADE_IMPORTS_DECISION_COMPARER_USER: 'readonly',
    TRADE_IMPORTS_DECISION_COMPARER_KEY: 'readonly',
    TRADE_IMPORTS_DATA_API_KEY: 'readonly',
    TRADE_IMPORTS_DATA_API_USER: 'readonly',
    BASE_URL_BTMS_GATEWAY: 'readonly',
    path: 'readonly',
    fs: 'readonly',
    allure: 'readonly',
    mochaStep: 'readonly',
    BASE_URL_TRADE_IMPORTS_DECISION_COMPARER: 'readonly',
    BASE_URL_TRADE_IMPORTS_DATA_API: 'readonly',
    COMPARER_AUTHORIZATION_HEADER: 'readonly',
    DATAAPI_AUTHORIZATION_HEADER: 'readonly',
    IPAFFS_KEY: 'readonly',
    POLL_INTERVAL_MS: 'readonly',
    TIMEOUT_MS: 'readonly',
    __filename: 'readonly',
    __dirname: 'readonly',
    fileURLToPath: 'readonly'


  }
}

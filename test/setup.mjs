/* eslint-disable import/first */
import '../setupGlobals.mjs'
// import 'dotenv/config'
import dotenvFlow from 'dotenv-flow'
/* eslint-enable import/first */

import { promoteEnvVars } from '../utils/promoteEnvVars.js'
import { traceModules } from '../logging/tracing.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import assert from 'node:assert'
import * as dsl from '../utils/testDsl.js'
import { createAsbSasToken, getAsbResourceUri } from '../utils/parseEnvVars.js'
import { expect } from 'chai'
import { step as mochaStep } from 'mocha-steps'

import * as rawSoapMessageBuilder from './utils/soapMessageBuilder.js'
import * as rawTestDataFunctions from './utils/testDataFunctions.js'
import * as rawDecisionParser from './utils/decisionParser.js'
import * as rawSendSoapRequest from './utils/soapMessageHandler.js'
import * as rawWaitForDecision from './utils/waitForDecision.js'
import * as rawTradeimportsdatapiMessageHandler from './utils/tradeimportsdatapiMessageHandler.js'
import * as rawIpaffsMessageHandler from './utils/ipaffsMessageHandler.js'
import * as rawTestContext from '../utils/testContext.js'

import process from 'process'
import { registerGlobalFunctions } from '../utils/registerGlobalFunctions.js'

dotenvFlow.config({
  node_env: process.env.NODE_ENV
})

function initGlobals() {
  const tracedModules = traceModules({
    testContext: rawTestContext,
    testDataFunctions: rawTestDataFunctions,
    ipaffsMessageHandler: rawIpaffsMessageHandler,
    decisionParser: rawDecisionParser,
    SoapMessageBuilder: rawSoapMessageBuilder,
    sendSoapRequest: rawSendSoapRequest,
    waitForDecision: rawWaitForDecision,
    tradeimportsdatapiMessageHandler: rawTradeimportsdatapiMessageHandler
  })

  registerGlobalFunctions({
    ...tracedModules,
    dsl,
    testData: rawTestContext.testData
  })

  const required = {
    ENVIRONMENT: {},
    TRADE_IMPORTS_DECISION_COMPARER_USER: {},
    TRADE_IMPORTS_DECISION_COMPARER_KEY: {},
    TRADE_IMPORTS_DATA_API_USER: {},
    TRADE_IMPORTS_DATA_API_KEY: {},
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

  globalThis.assert = assert
  globalThis.expect = expect
  globalThis.mochaStep = mochaStep

  globalThis.fs = fs
  globalThis.path = path
  globalThis.__filename = fileURLToPath(import.meta.url)
  globalThis.__dirname = path.dirname(globalThis.__filename)

  globalThis.BASE_URL_TRADE_IMPORTS_DATA_API = `https://trade-imports-data-api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
  globalThis.BASE_URL_TRADE_IMPORTS_DECISION_COMPARER = `https://trade-imports-decision-comparer.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`

  promoteEnvVars(['TRADE_IMPORTS_', 'IPAFFS_', 'BASE_URL_'])

  globalThis.COMPARER_AUTHORIZATION_HEADER =
    'Basic ' +
    Buffer.from(
      `${process.env.TRADE_IMPORTS_DECISION_COMPARER_USER}:${process.env.TRADE_IMPORTS_DECISION_COMPARER_KEY}`
    ).toString('base64')

  globalThis.TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER =
    'Basic ' +
    Buffer.from(
      `${process.env.TRADE_IMPORTS_DATA_API_USER}:${process.env.TRADE_IMPORTS_DATA_API_KEY}`
    ).toString('base64')

  globalThis.POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS)
  globalThis.TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS)
  globalThis.thisStepStartTime = null
  globalThis.previousStepStartTime = null

  globalThis.SUBMIT_CLEARANCE_REQUEST_ENDPOINT = `SubmitImportDocumentCDSFacadeService`
  globalThis.SUBMIT_FINALSIATION_ENDPOINT = `NotifyFinalisedStateCDSFacadeService`
  globalThis.SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT = `ALVSCDSErrorNotificationService`

  const cs = process.env.ServiceBus__Notifications__ConnectionString
  globalThis.IPAFFS_PATH = `${getAsbResourceUri(cs)}/messages`
  globalThis.IPAFFS_SAS_TOKEN = createAsbSasToken(cs)

  globalThis.proxy = process.env.CDP_HTTPS_PROXY
}
initGlobals()

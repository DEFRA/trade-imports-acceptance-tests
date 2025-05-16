import dotenv from 'dotenv'
import { SoapMessageBuilder } from './utils/soapMessageBuilder.js'
import {
  generateDocumentReference,
  generateRandomMRN,
  sleep,
  loadIPAFFSJson
} from './utils/testDataFunctions.js'
import { sendSoapRequest } from './utils/soapMessageHandler.js'
import { parseDecision } from './utils/decisionParser.js'
import { waitForDecision } from './utils/waitForDecision.js'
import { waitForDataInAPI } from './utils/tradeimportsdatapiMessageHandler.js'
import { sendIpaffsMessage } from './utils/ipaffsMessageHandler.js'
import assert from 'node:assert'
import { allure } from 'allure-mocha/runtime'
import { expect } from 'chai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { step as mochaStep } from 'mocha-steps'
dotenv.config({ path: './.env', override: true })
console.log('setup.js - ENVIRONMENT:', process.env.ENVIRONMENT)

const required = {
  ENVIRONMENT: {},
  TRADE_IMPORTS_DECISION_COMPARER_USER: {},
  TRADE_IMPORTS_DECISION_COMPARER_KEY: {},
  TRADE_IMPORTS_DATA_API_USER: {},
  TRADE_IMPORTS_DATA_API_KEY: {},
  IPAFFS_KEY: {},
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

globalThis.allure = allure
globalThis.assert = assert
globalThis.expect = expect
globalThis.mochaStep = mochaStep

globalThis.generateDocumentReference = generateDocumentReference
globalThis.generateRandomMRN = generateRandomMRN
globalThis.loadIPAFFSJson = loadIPAFFSJson
globalThis.parseDecision = parseDecision
globalThis.sendIpaffsMessage = sendIpaffsMessage
globalThis.sendSoapRequest = sendSoapRequest
globalThis.sleep = sleep
globalThis.SoapMessageBuilder = SoapMessageBuilder
globalThis.waitForDataInAPI = waitForDataInAPI
globalThis.waitForDecision = waitForDecision

globalThis.fs = fs
globalThis.path = path
globalThis.__filename = fileURLToPath(import.meta.url)
globalThis.__dirname = path.dirname(__filename)

globalThis.BASE_URL_BTMS_GATEWAY = `https://btms-gateway.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
globalThis.BASE_URL_TRADE_IMPORTS_DATA_API = `https://trade-imports-data-api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`
globalThis.BASE_URL_TRADE_IMPORTS_DECISION_COMPARER = `https://trade-imports-decision-comparer.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`

globalThis.IPAFFS_KEY = process.env.IPAFFS_KEY
globalThis.TRADE_IMPORTS_DATA_API_KEY = process.env.TRADE_IMPORTS_DATA_API_KEY
globalThis.TRADE_IMPORTS_DATA_API_USER = process.env.TRADE_IMPORTS_DATA_API_USER
globalThis.TRADE_IMPORTS_DECISION_COMPARER_KEY =
  process.env.TRADE_IMPORTS_DECISION_COMPARER_KEY
globalThis.TRADE_IMPORTS_DECISION_COMPARER_USER =
  process.env.TRADE_IMPORTS_DECISION_COMPARER_USER

globalThis.COMPARER_AUTHORIZATION_HEADER =
  'Basic ' +
  Buffer.from(
    `${TRADE_IMPORTS_DECISION_COMPARER_USER}:${TRADE_IMPORTS_DECISION_COMPARER_KEY}`
  ).toString('base64')

globalThis.TRADE_IMPORTS_DATA_API_AUTHORIZATION_HEADER =
  'Basic ' +
  Buffer.from(
    `${TRADE_IMPORTS_DATA_API_USER}:${TRADE_IMPORTS_DATA_API_KEY}`
  ).toString('base64')

globalThis.POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS)
globalThis.TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS)
globalThis.lastStartTime = null

globalThis.SUBMIT_CLEARANCE_REQUEST_ENDPOINT = `SubmitImportDocumentCDSFacadeService`
globalThis.SUBMIT_FINALSIATION_ENDPOINT = `NotifyFinalisedStateCDSFacadeService`
globalThis.SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT = `ALVSCDSErrorNotificationService`

globalThis.step = function (name, fn) {
  mochaStep(name, async function () {
    console.log(`=== ${name} ===`)
    lastStartTime = Date.now()

    try {
      await fn()
    } catch (error) {
      console.error(`Error in Step: ${name}`, error)
      throw error
    }
  })
}

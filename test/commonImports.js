import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import assert from 'node:assert'

import dotenv from 'dotenv'
import { expect } from 'chai'
import { allure } from 'allure-mocha/runtime'
import { step as mochaStep } from 'mocha-steps'
import {
  generateDocumentReference,
  generateRandomMRN,
  sleep,
  loadIPAFFSJson
} from './utils/testDataFunctions.js'

import { extractDecisionCodes } from './utils/decisionParser.js'
import { waitForDecision } from './utils/waitForDecision.js'
import { waitForDataInAPI } from './utils/tradeimportsdatapiMessageHandler.js'
import { sendIpaffsMessage } from './utils/ipaffsMessageHandler.js'

export default {
  fs,
  path,
  fileURLToPath,
  assert,
  dotenv,
  expect,
  allure,
  mochaStep,
  SoapMessageBuilder,
  generateDocumentReference,
  generateRandomMRN,
  sleep,
  loadIPAFFSJson,
  sendSoapRequest,
  extractDecisionCodes,
  waitForDecision,
  waitForDataInAPI,
  sendIpaffsMessage
}

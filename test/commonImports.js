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
  generateRandomGMR,
  sleep,
  loadIPAFFSJson,
  loadGmrJson
} from './utils/testDataFunctions.js'

import { extractDecisionCodes } from './utils/decisionParser.js'
import {
  waitForDecision,
  waitForSpecificDecision,
  waitForGmrDeclaration
} from './utils/waitForDecision.js'
import { waitForDataInAPI } from './utils/tradeimportsdatapiMessageHandler.js'
import { sendIpaffsMessage } from './utils/ipaffsMessageHandler.js'
import { sendGmrMessage } from './utils/gmrMessageHandler.js'
import { SoapMessageBuilder } from './utils/soapMessageBuilder.js'
import { sendSoapRequest } from './utils/soapMessageHandler.js'

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
  generateRandomGMR,
  sleep,
  loadIPAFFSJson,
  loadGmrJson,
  sendSoapRequest,
  extractDecisionCodes,
  waitForDecision,
  waitForSpecificDecision,
  waitForGmrDeclaration,
  waitForDataInAPI,
  sendIpaffsMessage,
  sendGmrMessage
}

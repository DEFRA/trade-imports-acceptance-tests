import { SoapMessageBuilder } from './utils/soapMessageBuilder.js'
import { generateRandomMRN } from './utils/testDataFunctions.js'
import { sendSoapRequest } from './utils/soapMessageHandler.js'
import { parseDecision } from './utils/decisionParser.js'
import { waitForDecision } from './utils/waitForDecision.js'
import assert from 'node:assert'

describe('Simple E2E Test', function () {
  it('Simple clearance Request expecting no match response', async function () {
    this.timeout(70000)

    // Create and send clearance request
    const builder = new SoapMessageBuilder()
    builder.addItem()
    builder.addItem({ TaricCommodityCode: '9999999999', ItemNetMass: '999.99' })
    builder.addItem({ Check: { CheckCode: 'H222' } })

    const mrn = generateRandomMRN()
    const soapEnvelope = builder.build({
      mrn: mrn
    })
    console.log(soapEnvelope)

    // Send SOAP request and get the response
    const response = await sendSoapRequest(soapEnvelope)
    console.log('Sent clearance request')

    // Wait for a decision to appear in the comparer and check the result
    const responseText = await waitForDecision(mrn)
    const decisionCode = parseDecision(responseText)
    console.log('DecisionCode:', decisionCode)
    assert.strictEqual(decisionCode, 'X00', 'Decision code does not match')
  })

  it('Large clearance Request expecting no match response', async function () {
    this.timeout(70000)

    // Create message
    const builder = new SoapMessageBuilder()

    for (let i = 0; i < 99; i++) {
      builder.addItem({
        TaricCommodityCode: i.toString().padStart(10, '0')
      })
    }

    const mrn = generateRandomMRN()
    const soapEnvelope = builder.build({
      mrn: mrn
    })
    console.log(soapEnvelope)

    // Send message
    const response = await sendSoapRequest(soapEnvelope)
    console.log('Sent clearance request')

    // Wait for a decision to appear in the comparer and check the result
    const responseText = await waitForDecision(mrn)
    const decisionCode = parseDecision(responseText)
    console.log('DecisionCode:', decisionCode)
    // TODO: Very basic inital assertion
    assert.strictEqual(decisionCode, 'X00', 'Decision code does not match')
  })
})

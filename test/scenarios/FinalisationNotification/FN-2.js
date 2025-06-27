import '#steps/steps.js'

describe('BTMS receives a Cancelled after arrival message for an existing MRN', function () {
  it.skip('', async function () {
    this.timeout(70000)

    this.docRef = generateDocumentReference()

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    const builder = new SoapMessageBuilder()

    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.buildMessage({
      EntryVersionNumber: 3,
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)

    const codes = await extractDecisionCodes(
      await waitForDecision(this.clearanceRequest.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', { decisionCodes: codes })
    assert(codes.includes('H01'), 'Expected decision code H01 not found')

    await step('Send finalisation', async () => {
      const finalisationSoapMsg = new SoapMessageBuilder('finalisation').build({
        EntryReference: this.mrn,
        EntryVersionNumber: 3,
        FinalState: 1,
        DecisionNumber: 1
      })

      testLogger.info(finalisationSoapMsg)
      await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, finalisationSoapMsg)
      testLogger.info('Sent finalisaton request')

      const responseText = await waitForDataInAPI(this.mrn)

      testLogger.info('Finalisation response:', { responseText })
      assert.ok(
        responseText.includes('"isManualRelease":true'),
        'Expected a manual release'
      )
    })
  })
})

describe('BTMS sends a DecisionNotification for a No Match decision on a MRN - DN-4', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    this.docRef = await generateDocumentReference()

    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.buildMessage({
      mrn: this.mrn
    })

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
    testLogger.info('Sent clearance request')
    testLogger.info(soapEnvelope)
    testLogger.info('Wait for decision - should be a hold X00')
    const decisionXml = await waitForSpecificDecision(this.mrn, 'X00')
    testLogger.info('Received decision with expected code X00')
    const codes = await extractDecisionCodes(decisionXml)
    testLogger.info('Received decision codes:', { decisionCodes: codes })
  })
})

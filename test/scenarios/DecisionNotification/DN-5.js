describe('BTMS sends a DecisionNotification for a Data Error decision on a MRN - DN-5', function () {
  it('', async function () {
    testLogger.info(
      'Send IPAFFS notification with decision (Data Error, Acceptable for Transit)'
    )

    this.docRef = await generateDocumentReference()

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'VALIDATED',
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Transit'
          },
          inspectionRequired: 'Not required'
        }
      })
    )

    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

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
    testLogger.info('Wait for decision - should be a hold E03')

    const decisionXml = await waitForSpecificDecision(this.mrn, 'E03')
    testLogger.info('Received decision with expected code E03')
    const codes = await extractDecisionCodes(decisionXml)
    testLogger.info('Received decision codes:', { decisionCodes: codes })
  })
})

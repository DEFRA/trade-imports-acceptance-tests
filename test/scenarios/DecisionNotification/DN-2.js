describe('BTMS sends a DecisionNotification for a Release decision on a MRN - DN-2', function () {
  it('', async function () {
    testLogger.info('Send initial IPAFFS notification')
    this.docRef = await generateDocumentReference()

    await sendIpaffsMessage(
      await loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
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
    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
    testLogger.info('Wait for decision - should be a hold H01')
    let decisionXml = await waitForSpecificDecision(this.mrn, 'H01')
    testLogger.info('Received decision with expected code H01')
    let codes = await extractDecisionCodes(decisionXml)
    testLogger.info('Received decision codes:', { decisionCodes: codes })

    testLogger.info(
      'Send updated IPAFFS notification with decision (to release)'
    )
    await sendIpaffsMessage(
      await loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'VALIDATED',
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market'
          },
          inspectionRequired: 'Not required'
        }
      })
    )

    testLogger.info('Wait for decision - should be a hold C03')
    decisionXml = await waitForSpecificDecision(this.mrn, 'C03')
    testLogger.info('Received decision with expected code C03')
    codes = await extractDecisionCodes(decisionXml)
    testLogger.info('Received decision codes:', { decisionCodes: codes })
  })
})

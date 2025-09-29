describe('BTMS receives a ClearanceRequest for a MRN with a single item with a multiple known IPAFFS DocumentReferences. Cancel one of the CHEDs - CR-7A', function () {
  it('', async function () {
    this.timeout(70000)
    testLogger.info('Send 2 IPAFFS notifications')
    this.docRef1 = await generateDocumentReference()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef1,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'CANCELLED',
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market'
          },
          inspectionRequired: 'Required'
        }
      })
    )

    this.docRef2 = await generateDocumentReference({ increment: 2 })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef2,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    builder
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef1 }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef2 }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })

    this.mrn = generateRandomMRN()
    testLogger.info('MRN:', this.mrn)
    testLogger.info('Items count:', builder.items.length)
    testLogger.info(JSON.stringify(builder.items, null, 2))
    const soapEnvelope = builder.buildMessage({
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
    testLogger.info('Sent clearance request')

    // Cancel Decision
    testLogger.info('Wait for decision - should be a hold X00')
    const decisionXmlCancel = await waitForSpecificDecision(this.mrn, 'X00')
    testLogger.info('Received decision with expected code X00')
    const codesCancel = await extractDecisionCodes(decisionXmlCancel)
    testLogger.info('Received decision codes:', { decisionCodes: codesCancel })

    // Hold Decision
    testLogger.info('Wait for decision - should be a hold H01')
    const decisionXmlHold = await waitForSpecificDecision(this.mrn, 'H01')
    testLogger.info('Received decision with expected code H01')
    const codesHold = await extractDecisionCodes(decisionXmlHold)
    testLogger.info('Received decision codes:', { decisionCodes: codesHold })
  })
  // Asserting on X00 but that could be anything, even a no match, need UI assertion on this test
  // It's not entirely possible to tell from the decision that it was cancelled
})

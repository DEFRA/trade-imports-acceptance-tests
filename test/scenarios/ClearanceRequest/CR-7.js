describe('BTMS receives a ClearanceRequest for a MRN with a single item with a multiple known IPAFFS DocumentReferences - CR-7', function () {
  it('', async function () {
    this.timeout(70000)
    testLogger.info('Send 2 IPAFFS notifications')
    this.docRef1 = generateDocumentReference()
    this.docRef2 = generateDocumentReference()

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

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef1,
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

    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    builder
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef2 }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef1 }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })

    this.mrn = generateRandomMRN()
    testLogger.info(this.mrn)
    testLogger.info('Items count:', builder.items.length)
    testLogger.info(JSON.stringify(builder.items, null, 2))
    const soapEnvelope = builder.buildMessage({
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
    testLogger.info('Sent clearance request')

    testLogger.info('Wait for decision - should be a hold H01')
    const codes = await extractDecisionCodes(
      await waitForDecision(this.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', { decisionCode: codes })
    assert(codes.includes('H01'), 'Expected decision code H01 not found')
  })
})

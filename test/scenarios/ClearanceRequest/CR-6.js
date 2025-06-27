describe('BTMS receives a ClearanceRequest for a MRN with a single item with a single known IPAFFS DocumentReference - CR-6', function () {
  it('', async function () {
    this.timeout(70000)
    testLogger.info('Send initial IPAFFS notification')
    this.docRef = generateDocumentReference()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    thisStepStartTime = Date.now()
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

    testLogger.info('Wait for decision - should be a hold H01')
    const codes = await extractDecisionCodes(
      await waitForDecision(this.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', codes)
    assert(codes.includes('H01'), 'Expected decision code H01 not found')
  })
})

describe('BTMS receives a ClearanceRequest for a MRN with the maximum number of items with a known IPAFFS DocumentReference - CR-8', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send 100 IPAFFS notifications')
    this.docRefs = []
    this.numberOfItems = 1

    for (let i = 1; i <= this.numberOfItems; i++) {
      this.docRefs[i] = generateDocumentReference()
      await sendIpaffsMessage(
        loadIPAFFSJson('CHEDA.json', {
          referenceNumber: this.docRefs[i],
          lastUpdated: new Date().toISOString(),
          partTwo: {
            decision: {},
            inspectionRequired: 'Not required'
          }
        })
      )
    }

    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    for (let i = 1; i <= this.numberOfItems; i++) {
      builder.addItem({
        TaricCommodityCode: '0103911000',
        Documents: [
          { DocumentCode: 'C640', DocumentReference: this.docRefs[i] }
        ],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
    }

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

    console.log('MRN is ', this.mrn)

    testLogger.info('Wait for decision - should be a hold H01')
    const decisionXml = await waitForSpecificDecision(this.mrn, 'H01')
    testLogger.info('Expecting 100 items to be H01')
    const codes = await extractDecisionCodes(decisionXml)
    const h01Count = codes.filter((code) => code === 'H01').length
    expect(h01Count).to.equal(this.numberOfItems)
  })
})

describe('BTMS receives a ClearanceRequest for a MRN with the maximum number of items with a known IPAFFS DocumentReference - CR-8', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send 100 IPAFFS notifications')
    this.docRefs = []
    this.numberOfItems = 1

    for (let i = 1; i <= this.numberOfItems; i++) {
      this.docRefs[i] = await generateDocumentReference()
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
    const testBuilder = newClearanceRequest()

    for (let i = 1; i <= this.numberOfItems; i++) {
      testBuilder.addItem({
        TaricCommodityCode: '0103911000',
        Documents: [
          { DocumentCode: 'C640', DocumentReference: this.docRefs[i] }
        ],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
    }

    await testBuilder
      .withMRN(generateRandomMRN())
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold H01')
        await test.waitForCheckDecision('H221', 'H01')
        testLogger.info('Expecting 100 items to be H01')
      })
  })
})

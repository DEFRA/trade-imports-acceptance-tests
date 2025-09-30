describe('BTMS receives a ClearanceRequest for a MRN with a single item with a multiple known IPAFFS DocumentReferences - CR-7', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send 2 IPAFFS notifications')
    this.docRef1 = await generateDocumentReference()
    this.docRef2 = await generateDocumentReference()

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
    await newClearanceRequest()
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
      .withMRN(generateRandomMRN())
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold H01')
        await test.waitForCheckDecision('H221', 'H01')
        testLogger.info('Received decision with expected code H01')
      })
  })
})

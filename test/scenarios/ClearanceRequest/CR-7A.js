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
    await newClearanceRequest()
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
      .withMRN(generateRandomMRN())
      .sendClearanceRequest()
      .then(async (test) => {
        // Cancel Decision
        testLogger.info('Wait for decision - should be a hold X00')
        await test.waitForDecision('X00')
        testLogger.info('Received decision with expected code X00')

        // Hold Decision
        testLogger.info('Wait for decision - should be a hold H01')
        await test.waitForCheckDecision('H221', 'H01')
        testLogger.info('Received decision with expected code H01')
      })
  })
  // Asserting on X00 but that could be anything, even a no match, need UI assertion on this test
  // It's not entirely possible to tell from the decision that it was cancelled
})

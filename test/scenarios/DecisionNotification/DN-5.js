describe('BTMS sends a DecisionNotification for a Data Error decision on a MRN - DN-5', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info(
      'Send IPAFFS notification with decision (Data Error, Acceptable for Transit)'
    )

    this.docRef = await generateDocumentReference()

    await sendIpaffsMessage(
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
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(generateRandomMRN())
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold E03')
        await test.waitForDecision('E03')
        testLogger.info('Received decision with expected code E03')
      })
  })
})

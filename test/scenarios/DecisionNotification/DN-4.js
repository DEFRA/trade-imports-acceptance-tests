describe('BTMS sends a DecisionNotification for a No Match decision on a MRN - DN-4', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send Clearance Request')
    this.docRef = await generateDocumentReference()

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(generateRandomMRN())
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold X00')
        await test.waitForDecision('X00')
        testLogger.info('Received decision with expected code X00')
      })
  })
})

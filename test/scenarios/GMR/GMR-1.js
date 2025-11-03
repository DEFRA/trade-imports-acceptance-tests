describe('BTMS receives a ClearanceRequest for a MRN with a single item with a single known IPAFFS DocumentReference and GMR - GMR-1', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send initial IPAFFS notification')
    this.docRef = await generateDocumentReference()
    this.gmrRef = await generateRandomGMR()
    this.mrnRef = await generateRandomMRN()

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

    await sendGmrMessage(
      loadGmrJson('GMR.json', {
        gmrId: this.gmrRef,
        updatedDateTime: new Date().toISOString(),
        declarations: {
          transits: [
            {
              id: this.mrnRef
            }
          ],
          customs: [
            {
              id: this.mrnRef
            }
          ]
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
      .withMRN(this.mrnRef)
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold H01')
        await test.waitForCheckDecision('H221', 'H01')
        testLogger.info('Received decision with expected code H01')
      })
  })
})

describe('BTMS receives a ClearanceRequest for a MRN with a HMI GMS Check Only - IP-10', function () {
  it('', async function () {
    this.timeout(70000)

    this.docRef = await generateDocumentReference({
      letter: 'PP',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP_GMS_ONLY.json', {
        version: 1,
        status: 'SUBMITTED',
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      })
    )
    testLogger.info('✓ A new IPAFFS notification sent successfully')

    // Send a Clearance request
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0803101000',
        GoodsDescription: 'Musa sp.',
        Documents: [{ DocumentCode: 'N002', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H220', DepartmentCode: 'HMI' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H220', 'H02')
      })
  })
})

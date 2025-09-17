describe('BTMS receives an IPAFFS message to change the status of an existing CHED to Replaced - ID-D3', function () {
  it('', async function () {
    this.timeout(70000)

    this.docRef = generateDocumentReference()
    this.mrn = generateRandomMRN()

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
    testLogger.info('✓ IPAFFS notification sent successfully')

    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H221', 'H01')
      })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'REPLACED',
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    testLogger.info('✓ IPAFFS notification update sent successfully')

    await waitForSpecificCheckDecision(this.mrn, 'H221', 'X00')
  })
})

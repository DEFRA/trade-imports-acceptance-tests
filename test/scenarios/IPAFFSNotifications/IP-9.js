describe('BTMS receives an IPAFFS CHED-PP that requires both a PHSI & HMI (GMS) inspection - IP-9', function () {
  it('', async function () {
    this.timeout(70000)

    // Create a ched-pp with multiple commodities
    this.docRef = await generateDocumentReference({
      letter: 'PP',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP_GMS.json', {
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
        TaricCommodityCode: '0910993100',
        GoodsDescription: 'Wild thyme (Thymus serpyllum)',
        Documents: [
          { DocumentCode: 'N851', DocumentReference: this.docRef },
          { DocumentCode: 'N002', DocumentReference: this.docRef }
        ],
        Checks: [
          { CheckCode: 'H219', DepartmentCode: 'PHSI' },
          { CheckCode: 'H220', DepartmentCode: 'HMI' }
        ]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H219', 'H02')
        await test.waitForCheckDecision('H220', 'H02')
      })
  })
})

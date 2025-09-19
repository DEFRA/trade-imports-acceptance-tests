describe('BTMS receives an IPAFFS CHED-PP that requires both a PHSI & HMI (SMS) inspection - IP-8', function () {
  it('', async function () {
    this.timeout(70000)

    // Create a ched-pp with multiple commodities
    this.docRef = generateDocumentReference({
      letter: 'PP',
      prefixLength: 4,
      suffixLength: 7
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP_SMS.json', {
        version: 1,
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
    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '0702001007',
        GoodsDescription: 'Cherry tomatoes',
        Documents: [
          { DocumentCode: 'N851', DocumentReference: this.docRef },
          { DocumentCode: 'N002', DocumentReference: this.docRef }
        ],
        Checks: [
          { CheckCode: 'H219', DepartmentCode: 'PHSI' },
          { CheckCode: 'H218', DepartmentCode: 'HMI' }
        ]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H218', 'H02')
        await test.waitForCheckDecision('H219', 'H02')
      })
  })
})

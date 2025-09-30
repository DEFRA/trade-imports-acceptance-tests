describe('BTMS receives an IPAFFS decision - IUU Compliant - IUU-3', function () {
  it('should receive both C03 and C07 decisions for IUU compliant clearance', async function () {
    this.timeout(70000)

    this.docRef = await generateDocumentReference({
      letter: 'P',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDP_IUU.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString()
      })
    )
    testLogger.info('✓ IPAFFS notification sent successfully')

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '1601009104',
        ItemNumber: 1,
        Documents: [
          { DocumentCode: 'N853', DocumentReference: this.docRef },
          { DocumentCode: 'C673', DocumentReference: 'GBIUU-VARIOUS' }
        ],
        Checks: [
          { CheckCode: 'H222', DepartmentCode: 'PHA' },
          { CheckCode: 'H224', DepartmentCode: 'PHA' }
        ]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H222', 'C03')
        await test.waitForCheckDecision('H224', 'C07')
      })
  })
})

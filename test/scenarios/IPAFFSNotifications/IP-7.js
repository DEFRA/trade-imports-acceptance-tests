describe('BTMS receives an IPAFFS CHED-PP that requires PHSI inspection only - IP-7', function () {
  it('', async function () {
    this.timeout(70000)

    // Create a ched-pp with multiple commodities
    this.docRef = await generateDocumentReference({
      letter: 'PP',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        version: 1,
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '84321000',
                commodityDescription: 'Ploughs',
                complementID: 1,
                complementName: 'Farm Machinery',
                eppoCode: 'NNNXX',
                speciesID: '1591031',
                speciesName: 'Farm Machinery',
                speciesClass: '1591031',
                speciesNomination: 'Farm Machinery'
              }
            ]
          }
        },
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
        TaricCommodityCode: '8432100000',
        GoodsDescription: 'Farm Machinery',
        Documents: [{ DocumentCode: 'N851', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H219', 'H02')
      })
  })
})

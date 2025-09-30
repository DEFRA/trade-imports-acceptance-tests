describe('Multiple CDS MRNs - in a GVMS EU crossing we will have multiple CDS MRN (can be from 4 - 5) - COM-1', function () {
  it('', async function () {
    this.timeout(70000)

    this.docRef = await generateDocumentReference({
      letter: 'PP',
      prefixLength: 4
    })

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

    // Send Clearance requests for all MRNs
    const mrns = [generateRandomMRN(), generateRandomMRN(), generateRandomMRN()]

    for (const mrn of mrns) {
      await newClearanceRequest()
        .addItem({
          TaricCommodityCode: '8432100000',
          GoodsDescription: 'Farm Machinery',
          Documents: [{ DocumentCode: 'N851', DocumentReference: this.docRef }],
          Checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }]
        })
        .withMRN(mrn)
        .withEntryVersionNumber(1)
        .sendClearanceRequest()
        .then(async (test) => {
          await test.waitForCheckDecision('H219', 'H02')
        })
    }
  })
})

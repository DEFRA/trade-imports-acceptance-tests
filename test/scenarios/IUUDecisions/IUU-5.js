describe('BTMS receives an IPAFFS decision - IUU No Need to inspect (IUUNA) - IUU-5', function () {
  it('', async function () {
    this.timeout(70000)

    this.docRef = await generateDocumentReference({
      letter: 'P',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDP_IUU.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          controlAuthority: {
            iuuOption: 'IUUNA'
          }
        }
      })
    )
    testLogger.info('✓ IPAFFS notification sent successfully')

    testLogger.info('Send Clearance Request')
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
        await test.waitForCheckDecision('H224', 'C08')
      })
  })
})

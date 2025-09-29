describe('BTMS receives an IPAFFS decision - IUU Not Compliant - IUU-4', function () {
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
        status: 'REJECTED',
        partTwo: {
          decision: {
            consignmentAcceptable: false,
            notAcceptableAction: 'other',
            notAcceptableActionOtherReason: 'no good',
            notAcceptableActionByDate: '2024-08-09',
            notAcceptableReasons: ['Other'],
            notAcceptableOtherReason: 'go home',
            decision: 'Non Acceptable'
          },
          controlAuthority: {
            iuuOption: 'IUUNotCompliant'
          }
        }
      })
    )
    testLogger.info('✓ IPAFFS notification sent successfully')

    testLogger.info('Send Clearance Request')
    await newFluentClearanceRequestTest()
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
        await test.waitForCheckDecision('H222', 'N07')
        await test.waitForCheckDecision('H224', 'X00')
      })
  })
})

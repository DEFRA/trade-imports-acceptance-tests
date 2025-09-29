describe('BTMS receives a Cancelled after arrival message for an existing MRN', function () {
  it('', async function () {
    this.timeout(70000)

    this.mrn = generateRandomMRN()
    this.docRef = await generateDocumentReference()

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(3)
      .withPreviousVersionNumber(2)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H221', 'H01')
      })

    await newFluentFinalisationTest()
      .withMRN(this.mrn)
      .withEntryVersionNumber(3)
      .withFinalState('1')
      .withDecisionNumber(1)
      .withManualAction('Y')
      .sendFinalisation()
      .then(async (test) => {
        await test.expectFinalisationState('1')
        await test.expectJson({ finalisation: { isManualRelease: true } })
      })
  })
})

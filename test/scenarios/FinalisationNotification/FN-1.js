describe('BTMS receives a Manual Override decision for an existing MRN - FN-1', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send initial IPAFFS notification')
    this.docRef = await generateDocumentReference()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: { consignmentAcceptable: false },
          inspectionRequired: 'Not required'
        }
      })
    )

    testLogger.info('Send Clearance Request')
    this.mrn = generateRandomMRN()

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        ItemNumber: 1,
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        ItemNumber: 75,
        TaricCommodityCode: '0103911001',
        Documents: [
          {
            DocumentCode: 'C640',
            DocumentReference: generateDocumentReference()
          }
        ],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold H01')
        await test.waitForCheckDecision('H221', 'H01')
        testLogger.info('Received decision with expected code H01')
      })

    testLogger.info(
      'Send updated IPAFFS notification with decision (to release)'
    )

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'VALIDATED',
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market'
          },
          inspectionRequired: 'Not required'
        }
      })
    )

    testLogger.info('Wait for decision - should be a hold C03')
    await waitForSpecificDecision(this.mrn, 'C03')
    testLogger.info('Received decision with expected code C03')

    testLogger.info('Send finalisation')
    await newFinalisationRequest()
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .withFinalState('0')
      .withDecisionNumber(2)
      .withManualAction('Y')
      .sendFinalisation()
      .then(async (test) => {
        await test.expectJson({ finalisation: { isManualRelease: true } })
        testLogger.info('Finalisation response received')
      })
  })
})

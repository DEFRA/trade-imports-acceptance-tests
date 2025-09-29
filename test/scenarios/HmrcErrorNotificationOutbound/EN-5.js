describe('BTMS receives a FinalisationNotification for an MRN which is already cancelled - EN-5', function () {
  it('should handle finalisation notification for already cancelled MRN', async function () {
    this.timeout(70000)

    this.docRef = await generateDocumentReference()
    this.mrn = generateRandomMRN()

    testLogger.info('Send initial IPAFFS notification')
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
    await newFluentClearanceRequestTest()
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
      .then((test) => test.waitForDecision('H01'))

    testLogger.info('Received decision with expected code H01')

    testLogger.info(
      'Send updated IPAFFS notification with decision (to release) and wait for C03'
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
    ).then(() => waitForDecision(this.mrn, 'C03'))

    testLogger.info('Received decision with expected code C03')

    testLogger.info('Send cancellation')
    let responseText = await newFluentFinalisationTest()
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .withFinalState('1')
      .withDecisionNumber(2)
      .withManualAction('N')
      .sendFinalisation()
      .then((test) => test.expectFinalisationState('1'))

    testLogger.info('Cancellation response:', { responseText })

    testLogger.info('Send finalisation')
    responseText = await newFluentFinalisationTest()
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .withFinalState('0')
      .withDecisionNumber(3)
      .withManualAction('Y')
      .sendFinalisation()
      .then((test) => test.expectFinalisationState('1', 15000))

    testLogger.info('Finalisation response:', { responseText })
  })
})

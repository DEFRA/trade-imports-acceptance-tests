describe('BTMS sends a DecisionNotification for a Refusal decision on a MRN', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send initial IPAFFS notification')
    this.docRef = await generateDocumentReference()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    await waitForDataInAPI(this.docRef, 'IPAFFS')

    testLogger.info('Send Clearance Request')
    this.mrn = generateRandomMRN()

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .sendClearanceRequest()
      .then(async (test) => {
        testLogger.info('Wait for decision - should be a hold H01')
        await test.waitForCheckDecision('H221', 'H01')
        testLogger.info('Received decision with expected code H01')
      })

    await waitForDataInAPI(this.mrn)

    testLogger.info('Send updated IPAFFS notification with decision (refusal)')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'REJECTED',
        partTwo: {
          decision: {
            consignmentAcceptable: false,
            notAcceptableAction: 'reexport',
            notAcceptableActionByDate: new Date(Date.now() + 604800000)
              .toISOString()
              .split('T')[0],
            notAcceptableReasons: ['AbsenceAdditionalGuarantees'],
            decision: 'Non Acceptable'
          },
          inspectionRequired: 'Not required'
        }
      })
    )

    await waitForDataInAPI(this.docRef, 'IPAFFS', {
      importPreNotification: { version: 2 }
    })

    testLogger.info('Wait for decision - should be a Refusal N04')
    await waitForSpecificDecision(this.mrn, 'N04')
    testLogger.info('Received decision with expected code N04')
  })
})

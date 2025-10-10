describe('Reporting Latest Results for Reporting', function () {
  it('', async function () {
    this.timeout(70000)
    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    testLogger.info('From and To dates: ', { fromDate: from, toDate: to })

    testLogger.info('Getting Last Received Data')
    const lastReceivedRequest = await getLastReceived()
    const finalisationTime =
      lastReceivedRequest.finalisation &&
      lastReceivedRequest.finalisation.timestamp
        ? new Date(lastReceivedRequest.finalisation.timestamp).getTime()
        : 0

    const requestTime =
      lastReceivedRequest.request && lastReceivedRequest.request.timestamp
        ? new Date(lastReceivedRequest.request.timestamp).getTime()
        : 0

    const notificationTime =
      lastReceivedRequest.notification &&
      lastReceivedRequest.notification.timestamp
        ? new Date(lastReceivedRequest.notification.timestamp).getTime()
        : 0

    testLogger.info('Send Clearance Request')
    this.docRef = await generateDocumentReference()
    this.mrn = generateRandomMRN()

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForDecision('X00')
      })

    testLogger.info('Send IPAFFS notification')
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
    thisStepStartTime = Date.now()
    await waitForSpecificDecision(this.mrn, 'H01')

    testLogger.info('Send Finalisation')
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

    testLogger.info('Asserting on Last Received')
    const updatedLastReceivedRequest = await getLastReceived()

    const updatedFinalisationTime = new Date(
      updatedLastReceivedRequest.finalisation.timestamp
    )
    const updatedFinalisationReference =
      updatedLastReceivedRequest.finalisation.reference
    expect(updatedFinalisationTime.getTime()).to.be.greaterThan(
      finalisationTime
    )
    expect(updatedFinalisationReference).to.equal(this.mrn)

    const updatedRequestTime = new Date(
      updatedLastReceivedRequest.request.timestamp
    )
    const updatedRequestReference = updatedLastReceivedRequest.request.reference
    expect(updatedRequestTime.getTime()).to.be.greaterThan(requestTime)
    expect(updatedRequestReference).to.equal(this.mrn)

    const updatedNotificationTime = new Date(
      updatedLastReceivedRequest.notification.timestamp
    )
    const updatedNotificationReference =
      updatedLastReceivedRequest.notification.reference
    expect(updatedNotificationTime.getTime()).to.be.greaterThan(
      notificationTime
    )
    expect(updatedNotificationReference).to.equal(this.docRef)
  })
})

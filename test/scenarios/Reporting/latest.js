describe('Reporting Latest Results for Reporting', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Getting Last Received Data')
    const lastReceivedRequest = await getLastReceived()
    const finalisationTime =
      lastReceivedRequest.finalisation &&
      lastReceivedRequest.finalisation.timestamp
        ? new Date(lastReceivedRequest.finalisation.timestamp).getTime()
        : 0

    const requestTime =
      lastReceivedRequest.clearanceRequest &&
      lastReceivedRequest.clearanceRequest.timestamp
        ? new Date(lastReceivedRequest.clearanceRequest.timestamp).getTime()
        : 0

    const notificationTime =
      lastReceivedRequest.preNotification &&
      lastReceivedRequest.preNotification.timestamp
        ? new Date(lastReceivedRequest.preNotification.timestamp).getTime()
        : 0

    const tracesChedTime =
      lastReceivedRequest.tracesChed && lastReceivedRequest.tracesChed.timestamp
        ? new Date(lastReceivedRequest.tracesChed.timestamp).getTime()
        : 0

    const chedReservationTime =
      lastReceivedRequest.chedReservation &&
      lastReceivedRequest.chedReservation.timestamp
        ? new Date(lastReceivedRequest.chedReservation.timestamp).getTime()
        : 0

    testLogger.info('Create and send TRACES CHED')
    this.tracesRef = await generateDocumentReference()
    const tracesJson = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.tracesRef
      return setTracesLastUpdateTime(content, new Date().toISOString())
    })
    const { response: tracesResponse } =
      await processorPostTracesChed(tracesJson)
    expect(tracesResponse.status).to.equal(204)

    testLogger.info('Create and send CHED Reservation')
    const chedReservationMrn = generateRandomMRN()
    const chedReservation = {
      chedId: this.tracesRef,
      mrn: chedReservationMrn,
      status: 'Reserved',
      timestamp: new Date().toISOString(),
      commodities: []
    }
    const { response: reservationResponse } = await dataApiPutChedReservation(
      this.tracesRef,
      chedReservationMrn,
      chedReservation
    )
    expect(reservationResponse.status).to.equal(200)
    this.chedReservationId = `${this.tracesRef}_${chedReservationMrn}`

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
      updatedLastReceivedRequest.clearanceRequest.timestamp
    )
    const updatedRequestReference =
      updatedLastReceivedRequest.clearanceRequest.reference
    expect(updatedRequestTime.getTime()).to.be.greaterThan(requestTime)
    expect(updatedRequestReference).to.equal(this.mrn)

    const updatedNotificationTime = new Date(
      updatedLastReceivedRequest.preNotification.timestamp
    )
    const updatedNotificationReference =
      updatedLastReceivedRequest.preNotification.reference
    expect(updatedNotificationTime.getTime()).to.be.greaterThan(
      notificationTime
    )
    expect(updatedNotificationReference).to.equal(this.docRef)

    const updatedTracesChedTime = new Date(
      updatedLastReceivedRequest.tracesChed.timestamp
    )
    const updatedTracesChedReference =
      updatedLastReceivedRequest.tracesChed.reference
    expect(updatedTracesChedTime.getTime()).to.be.greaterThan(tracesChedTime)
    expect(updatedTracesChedReference).to.equal(this.tracesRef)

    const updatedChedReservationTime = new Date(
      updatedLastReceivedRequest.chedReservation.timestamp
    )
    const updatedChedReservationReference =
      updatedLastReceivedRequest.chedReservation.reference
    expect(updatedChedReservationTime.getTime()).to.be.greaterThan(
      chedReservationTime
    )
    expect(updatedChedReservationReference).to.equal(this.chedReservationId)
  })
})

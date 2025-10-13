describe('Reporting Last Sent and Status Endpoints', function () {
  it('should send test data and validate /last-sent endpoint timestamps are updated', async function () {
    testLogger.info('Getting initial /last-sent value')
    const beforeLastSent = await getLastSent()
    const beforeDecisionTimestamp =
      beforeLastSent.decision && beforeLastSent.decision.timestamp
        ? new Date(beforeLastSent.decision.timestamp).getTime()
        : 0

    testLogger.info('Sending test data for /last-sent endpoint')
    const docRef = await generateDocumentReference()
    const mrn = generateRandomMRN()

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForDecision('X00')
      })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    await waitForSpecificDecision(mrn, 'H01')

    await newFinalisationRequest()
      .withMRN(mrn)
      .withEntryVersionNumber(1)
      .withFinalState('0')
      .withDecisionNumber(2)
      .withManualAction('Y')
      .sendFinalisation()
      .then(async (test) => {
        await test.expectJson({ finalisation: { isManualRelease: true } })
        testLogger.info('Finalisation response received')
      })

    testLogger.info('Getting updated /last-sent value')
    const afterLastSent = await getLastSent()
    const afterDecisionTimestamp =
      afterLastSent.decision && afterLastSent.decision.timestamp
        ? new Date(afterLastSent.decision.timestamp).getTime()
        : 0
    const afterDecisionReference = afterLastSent.decision?.reference || null

    expect(afterDecisionTimestamp).to.be.greaterThan(beforeDecisionTimestamp)
    expect(afterDecisionReference).to.equal(mrn)
  })

  it('should send test data and validate /status endpoint timestamps are updated', async function () {
    testLogger.info('Getting initial /status value')
    const beforeStatus = await getStatus()
    const beforeReceivedFinalisationTimestamp = beforeStatus.received
      ?.finalisation?.timestamp
      ? new Date(beforeStatus.received.finalisation.timestamp).getTime()
      : 0
    const beforeReceivedClearanceRequestTimestamp = beforeStatus.received
      ?.clearanceRequest?.timestamp
      ? new Date(beforeStatus.received.clearanceRequest.timestamp).getTime()
      : 0
    const beforeReceivedPreNotificationTimestamp = beforeStatus.received
      ?.preNotification?.timestamp
      ? new Date(beforeStatus.received.preNotification.timestamp).getTime()
      : 0
    const beforeSentDecisionTimestamp = beforeStatus.sent?.decision?.timestamp
      ? new Date(beforeStatus.sent.decision.timestamp).getTime()
      : 0

    testLogger.info('Sending test data for /status endpoint')
    const docRef = await generateDocumentReference()
    const mrn = generateRandomMRN()

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForDecision('X00')
      })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    await waitForSpecificDecision(mrn, 'H01')

    await newFinalisationRequest()
      .withMRN(mrn)
      .withEntryVersionNumber(1)
      .withFinalState('0')
      .withDecisionNumber(2)
      .withManualAction('Y')
      .sendFinalisation()
      .then(async (test) => {
        await test.expectJson({ finalisation: { isManualRelease: true } })
        testLogger.info('Finalisation response received')
      })

    testLogger.info('Getting updated /status value')
    const afterStatus = await getStatus()
    const afterReceivedFinalisationTimestamp = afterStatus.received
      ?.finalisation?.timestamp
      ? new Date(afterStatus.received.finalisation.timestamp).getTime()
      : 0
    const afterReceivedClearanceRequestTimestamp = afterStatus.received
      ?.clearanceRequest?.timestamp
      ? new Date(afterStatus.received.clearanceRequest.timestamp).getTime()
      : 0
    const afterReceivedPreNotificationTimestamp = afterStatus.received
      ?.preNotification?.timestamp
      ? new Date(afterStatus.received.preNotification.timestamp).getTime()
      : 0
    const afterSentDecisionTimestamp = afterStatus.sent?.decision?.timestamp
      ? new Date(afterStatus.sent.decision.timestamp).getTime()
      : 0

    const afterReceivedFinalisationReference =
      afterStatus.received?.finalisation?.reference || null
    const afterReceivedClearanceRequestReference =
      afterStatus.received?.clearanceRequest?.reference || null
    const afterReceivedPreNotificationReference =
      afterStatus.received?.preNotification?.reference || null
    const afterSentDecisionReference =
      afterStatus.sent?.decision?.reference || null

    expect(afterReceivedFinalisationTimestamp).to.be.greaterThan(
      beforeReceivedFinalisationTimestamp
    )
    expect(afterReceivedClearanceRequestTimestamp).to.be.greaterThan(
      beforeReceivedClearanceRequestTimestamp
    )
    expect(afterReceivedPreNotificationTimestamp).to.be.greaterThan(
      beforeReceivedPreNotificationTimestamp
    )
    expect(afterSentDecisionTimestamp).to.be.greaterThan(
      beforeSentDecisionTimestamp
    )
    expect(afterReceivedFinalisationReference).to.equal(mrn)
    expect(afterReceivedClearanceRequestReference).to.equal(mrn)
    expect(afterReceivedPreNotificationReference).to.equal(docRef)
    expect(afterSentDecisionReference).to.equal(mrn)
  })
})

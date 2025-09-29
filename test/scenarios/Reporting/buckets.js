describe('Reporting Bucket Results for Reporting', function () {
  it('', async function () {
    this.timeout(70000)
    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    testLogger.info('From and To dates: ', { fromDate: from, toDate: to })

    testLogger.info('Getting Clearance Request Bucket Data')
    const clearanceRequestBucket = await getClearanceRequestBucket(
      from,
      to,
      'day'
    )
    const clearanceRequestBucketUnique =
      clearanceRequestBucket.intervals[0].summary.unique + 1

    testLogger.info('Getting Notification Bucket Data')
    const notificationBucket = await getNotificationBucket(from, to, 'day')
    const noticationBucketTotal =
      notificationBucket.intervals[0].summary.total + 1

    testLogger.info('Getting Matches Bucket Data')
    const matchesBucket = await getMatchesBucket(from, to, 'day')
    const matchesBucketTotal = matchesBucket.intervals[0].summary.total + 1

    testLogger.info('Getting Release Bucket Data')
    const releasesBucket = await getReleaseBucket(from, to, 'day')
    const releasedBucketTotal = releasesBucket.intervals[0].summary.total + 1

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

    testLogger.info('Asserting on Clearance Requests')
    const actualClearanceRequestBucketUnique = await pollForExpectedValue(
      () => getClearanceRequestBucket(from, to, 'day'),
      (data) => data.intervals[0].summary.unique,
      clearanceRequestBucketUnique
    )
    expect(actualClearanceRequestBucketUnique).to.equal(
      clearanceRequestBucketUnique
    )

    testLogger.info('Asserting on Notifications')
    const actualNoticationBucketTotal = await pollForExpectedValue(
      () => getNotificationBucket(from, to, 'day'),
      (data) => data.intervals[0].summary.total,
      noticationBucketTotal
    )
    expect(actualNoticationBucketTotal).to.equal(noticationBucketTotal)

    testLogger.info('Asserting on Matches')
    const actualMatchesBucketTotal = await pollForExpectedValue(
      () => getMatchesBucket(from, to, 'day'),
      (data) => data.intervals[0].summary.total,
      matchesBucketTotal
    )
    expect(actualMatchesBucketTotal).to.equal(matchesBucketTotal)

    testLogger.info('Asserting on Releases')
    const actualReleasedBucketTotal = await pollForExpectedValue(
      () => getReleaseBucket(from, to, 'day'),
      (data) => data.intervals[0].summary.total,
      releasedBucketTotal
    )
    expect(actualReleasedBucketTotal).to.equal(releasedBucketTotal)
  })
})

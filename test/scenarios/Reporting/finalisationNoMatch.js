const noMatchCases = [
  {
    finalStateName: 'Cleared',
    finalState: '0',
    isManualRelease: 'Y',
    isManualReleaseState: true,
    increaseMatchesBy: 0,
    increaseReleasesBy: 1
  },
  {
    finalStateName: 'Cancelled after arrival',
    finalState: '1',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 0,
    increaseReleasesBy: 0
  },
  {
    finalStateName: 'Cancelled while pre-lodged',
    finalState: '2',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 0,
    increaseReleasesBy: 0
  }
]

describe('Reporting Intervals Results for Reporting Finalisation on No Match', function () {
  noMatchCases.forEach(
    ({
      finalStateName,
      finalState,
      isManualRelease,
      isManualReleaseState,
      increaseMatchesBy,
      increaseReleasesBy
    }) => {
      it(`When its ${finalStateName}, Final State of ${finalState} and Manual Release is: ${isManualReleaseState}`, async function () {
        this.timeout(70000)
        const now = Date.now()
        const from = new Date(now - 10 * 1000).toISOString()
        const to = new Date(now + 10 * 1000).toISOString()
        testLogger.info('From and To dates: ', { fromDate: from, toDate: to })

        testLogger.info('Getting Clearance Request Interval Data')
        const clearanceRequest = await getClearanceRequestInterval(
          from,
          to,
          from
        )
        const expectedClearanceRequestInterval =
          clearanceRequest.intervals[0].summary.total + 1

        testLogger.info('Getting Notification Interval Data')
        const notificationRequest = await getNotificationInterval(
          from,
          to,
          from
        )
        const expectedNotificationRequestChedAInterval =
          notificationRequest.intervals[0].summary.total

        testLogger.info('Getting Matches Interval Data')
        const matchesRequest = await getMatchesInterval(from, to, from)
        const expectedMatchesRequestMatchInterval =
          matchesRequest.intervals[0].summary.total + increaseMatchesBy

        testLogger.info('Getting Release Interval Data')
        const releaseRequest = await getReleasesInterval(from, to, from)
        const expectedReleaseRequestTotal =
          releaseRequest.intervals[0].summary.manual + increaseReleasesBy

        testLogger.info('Send Clearance Request')
        this.docRef = await generateDocumentReference()
        this.mrn = generateRandomMRN()

        await newClearanceRequest()
          .addItem({
            TaricCommodityCode: '0103911000',
            Documents: [
              { DocumentCode: 'C640', DocumentReference: this.docRef }
            ],
            Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
          })
          .withMRN(this.mrn)
          .withEntryVersionNumber(1)
          .sendClearanceRequest()
          .then(async (test) => {
            await test.waitForDecision('X00')
          })

        thisStepStartTime = Date.now()
        await waitForSpecificDecision(this.mrn, 'X00')

        testLogger.info('Send Finalisation')
        await newFinalisationRequest()
          .withMRN(this.mrn)
          .withEntryVersionNumber(1)
          .withFinalState(finalState)
          .withDecisionNumber(1)
          .withManualAction(isManualRelease)
          .sendFinalisation()
          .then(async (test) => {
            await test.expectJson({
              finalisation: { isManualRelease: isManualReleaseState }
            })
            testLogger.info('Finalisation response received')
          })

        testLogger.info('Asserting on Clearance Requests')
        const actualClearanceRequestIntervalUnique = await pollForExpectedValue(
          () => getClearanceRequestInterval(from, to, from),
          (data) => data.intervals[0].summary.unique,
          expectedClearanceRequestInterval
        )
        expect(actualClearanceRequestIntervalUnique).to.equal(
          expectedClearanceRequestInterval
        )

        testLogger.info('Asserting on Notifications')
        const actualNotificationRequestChedAInterval =
          await pollForExpectedValue(
            () => getNotificationInterval(from, to, from),
            (data) => data.intervals[0].summary.total,
            expectedNotificationRequestChedAInterval
          )
        expect(actualNotificationRequestChedAInterval).to.equal(
          expectedNotificationRequestChedAInterval
        )

        testLogger.info('Asserting on Matches')
        const actualMatchesRequestMatchInterval = await pollForExpectedValue(
          () => getMatchesInterval(from, to, from),
          (data) => data.intervals[0].summary.total,
          expectedMatchesRequestMatchInterval
        )
        expect(actualMatchesRequestMatchInterval).to.equal(
          expectedMatchesRequestMatchInterval
        )

        testLogger.info('Asserting on Releases')
        const actualReleaseRequestTotal = await pollForExpectedValue(
          () => getReleasesInterval(from, to, from),
          (data) => data.intervals[0].summary.manual,
          expectedReleaseRequestTotal
        )
        expect(actualReleaseRequestTotal).to.equal(expectedReleaseRequestTotal)
      })
    }
  )
})

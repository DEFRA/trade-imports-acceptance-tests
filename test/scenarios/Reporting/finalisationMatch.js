const matchCases = [
  {
    finalStateName: 'Cleared',
    finalState: '0',
    isManualRelease: 'Y',
    isManualReleaseState: true,
    increaseMatchesBy: 1,
    increaseReleasesBy: 1
  },
  {
    finalStateName: 'Cleared',
    finalState: '0',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 1
  },
  {
    finalStateName: 'Cancelled after arrival',
    finalState: '1',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 0
  },
  {
    finalStateName: 'Cancelled while pre-lodged',
    finalState: '2',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 0
  },
  {
    finalStateName: 'Destroyed',
    finalState: '3',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 1
  },
  {
    finalStateName: 'Seized',
    finalState: '4',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 1
  },
  {
    finalStateName: 'Released to King’s warehouse',
    finalState: '5',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 1
  },
  {
    finalStateName: 'Transferred to MSS ',
    finalState: '6',
    isManualRelease: 'N',
    isManualReleaseState: false,
    increaseMatchesBy: 1,
    increaseReleasesBy: 1
  }
]

describe('Reporting Intervals Results for Reporting Finalisation on Match', function () {
  matchCases.forEach(
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
          notificationRequest.intervals[0].summary.chedA + 1

        testLogger.info('Getting Matches Interval Data')
        const matchesRequest = await getMatchesInterval(from, to, from)
        const expectedMatchesRequestMatchInterval =
          matchesRequest.intervals[0].summary.match + increaseMatchesBy

        testLogger.info('Getting Release Interval Data')
        const releaseRequest = await getReleasesInterval(from, to, from)
        const expectedReleaseRequestTotal =
          releaseRequest.intervals[0].summary.total + increaseReleasesBy

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
            (data) => data.intervals[0].summary.chedA,
            expectedNotificationRequestChedAInterval
          )
        expect(actualNotificationRequestChedAInterval).to.equal(
          expectedNotificationRequestChedAInterval
        )

        testLogger.info('Asserting on Matches')
        const actualMatchesRequestMatchInterval = await pollForExpectedValue(
          () => getMatchesInterval(from, to, from),
          (data) => data.intervals[0].summary.match,
          expectedMatchesRequestMatchInterval
        )
        expect(actualMatchesRequestMatchInterval).to.equal(
          expectedMatchesRequestMatchInterval
        )

        testLogger.info('Asserting on Releases')
        const actualReleaseRequestTotal = await pollForExpectedValue(
          () => getReleasesInterval(from, to, from),
          (data) => data.intervals[0].summary.total,
          expectedReleaseRequestTotal
        )
        expect(actualReleaseRequestTotal).to.equal(expectedReleaseRequestTotal)
      })
    }
  )
})

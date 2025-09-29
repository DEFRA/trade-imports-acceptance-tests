import { expect } from 'chai'
import {
  getClearanceRequestInterval,
  getNotificationInterval,
  getMatchesInterval,
  getReleasesInterval,
  pollForExpectedValue
} from '../../utils/reportingClient.js'

describe('Reporting Intervals Results for Reporting', function () {
  it('', async function () {
    this.timeout(70000)
    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    testLogger.info('From and To dates: ', { fromDate: from, toDate: to })

    testLogger.info('Getting Clearance Request Interval Data')
    const clearanceRequest = await getClearanceRequestInterval(from, to, from)
    const expectedClearanceRequestInterval =
      clearanceRequest.intervals[0].summary.unique + 1

    testLogger.info('Getting Notification Interval Data')
    const notificationRequest = await getNotificationInterval(from, to, from)
    const expectedNotificationRequestChedAInterval =
      notificationRequest.intervals[0].summary.chedA + 1

    testLogger.info('Getting Matches Interval Data')
    const matchesRequest = await getMatchesInterval(from, to, from)
    const expectedMatchesRequestMatchInterval =
      matchesRequest.intervals[0].summary.match + 1

    testLogger.info('Getting Release Interval Data')
    const releaseRequest = await getReleasesInterval(from, to, from)
    const expectedReleaseRequestManaul =
      releaseRequest.intervals[0].summary.manual + 1

    testLogger.info('Send Clearance Request')
    this.docRef = await generateDocumentReference()
    const builder = new SoapMessageBuilder()
    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })
    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.buildMessage({
      mrn: this.mrn
    })
    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
    await waitForSpecificDecision(this.mrn, 'X00')

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
    const finalisationSoapMsg = new SoapMessageBuilder(
      'finalisation'
    ).buildMessage({
      EntryReference: this.mrn,
      EntryVersionNumber: 1,
      FinalState: '0',
      DecisionNumber: 2,
      ManualAction: 'Y'
    })
    await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, finalisationSoapMsg)
    testLogger.info('Sent finalisaton request')
    const responseText = await waitForDataInAPI(this.mrn, '', {
      finalisation: { isManualRelease: true }
    })
    testLogger.info('Finalisation response:', { responseText })

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
    const actualNotificationRequestChedAInterval = await pollForExpectedValue(
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
    const actualReleaseRequestManaul = await pollForExpectedValue(
      () => getReleasesInterval(from, to, from),
      (data) => data.intervals[0].summary.manual,
      expectedReleaseRequestManaul
    )
    expect(actualReleaseRequestManaul).to.equal(expectedReleaseRequestManaul)
  })
})

import { expect } from 'chai'
import {
  pollForExpectedValue,
  getClearanceRequestBucket,
  getNotificationBucket,
  getMatchesBucket,
  getReleaseBucket
} from '../../utils/reportingClient.js'

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
    this.docRef = generateDocumentReference()
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

    testLogger.info(finalisationSoapMsg)
    await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, finalisationSoapMsg)
    testLogger.info('Sent finalisaton request')
    const responseText = await waitForDataInAPI(this.mrn, '', {
      finalisation: { isManualRelease: true }
    })
    testLogger.info('Finalisation response:', { responseText })

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

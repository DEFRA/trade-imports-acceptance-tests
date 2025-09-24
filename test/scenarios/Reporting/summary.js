import { expect } from 'chai'
import {
  getClearanceRequestSummary,
  getNotificationSummary,
  getMatchesSummary,
  getReleasesSummary,
  pollForExpectedValue,
  getLastReceived
} from '../../utils/reportingClient.js'

describe('Reporting Summary Results for Reporting', function () {
  it('', async function () {
    this.timeout(70000)
    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    testLogger.info('From and To dates: ', { fromDate: from, toDate: to })

    testLogger.info('Getting Clearance Request Summary Data')
    const clearanceRequest = await getClearanceRequestSummary(from, to)
    const expectedClearanceRequestTotal = clearanceRequest.total + 1
    const expectedClearanceRequestUnique = clearanceRequest.unique + 1

    testLogger.info('Getting Notification Summary Data')
    const notificationRequest = await getNotificationSummary(from, to)
    const expectedNotificationRequestChedA = notificationRequest.chedA + 1
    const expectedNotificationRequestTotal = notificationRequest.total + 1

    testLogger.info('Getting Matches Summary Data')
    const matchesRequest = await getMatchesSummary(from, to)
    const expectedMatchesRequestMatch = matchesRequest.match + 1
    const expectedMatchesRequestTotal = matchesRequest.total + 1

    testLogger.info('Getting Release Summary Data')
    const releaseRequest = await getReleasesSummary(from, to)
    const expectedReleaseRequestManaul = releaseRequest.manual + 1
    const expectedReleaseRequestTotal = releaseRequest.total + 1

    testLogger.info('Getting Last Received Data')
    const lastReceivedRequest = await getLastReceived()
    const finalisationTime = new Date(
      lastReceivedRequest.finalisation.timestamp
    )
    const requestTime = new Date(lastReceivedRequest.request.timestamp)

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
    await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, finalisationSoapMsg)
    testLogger.info('Sent finalisaton request')
    const responseText = await waitForDataInAPI(this.mrn, '', {
      finalisation: { isManualRelease: true }
    })
    testLogger.info('Finalisation response:', { responseText })

    testLogger.info('Asserting on Clearance Requests')
    const actualClearanceRequestTotal = await pollForExpectedValue(
      () => getClearanceRequestSummary(from, to),
      (data) => data.total,
      expectedClearanceRequestTotal
    )
    const actualClearanceRequestUnique = await pollForExpectedValue(
      () => getClearanceRequestSummary(from, to),
      (data) => data.unique,
      expectedClearanceRequestUnique
    )
    expect(actualClearanceRequestTotal).to.equal(expectedClearanceRequestTotal)
    expect(actualClearanceRequestUnique).to.equal(
      expectedClearanceRequestUnique
    )

    testLogger.info('Asserting on Notifications')
    const actualNotificationRequestChedA = await pollForExpectedValue(
      () => getNotificationSummary(from, to),
      (data) => data.chedA,
      expectedNotificationRequestChedA
    )
    const actualNotificationRequestTotal = await pollForExpectedValue(
      () => getNotificationSummary(from, to),
      (data) => data.total,
      expectedNotificationRequestTotal
    )
    expect(actualNotificationRequestChedA).to.equal(
      expectedNotificationRequestChedA
    )
    expect(actualNotificationRequestTotal).to.equal(
      expectedNotificationRequestTotal
    )

    testLogger.info('Asserting on Matches')
    const actualMatchesRequestMatch = await pollForExpectedValue(
      () => getMatchesSummary(from, to),
      (data) => data.match,
      expectedMatchesRequestMatch
    )
    const actualMatchesRequestTotal = await pollForExpectedValue(
      () => getMatchesSummary(from, to),
      (data) => data.total,
      expectedMatchesRequestTotal
    )
    expect(actualMatchesRequestMatch).to.equal(expectedMatchesRequestMatch)
    expect(actualMatchesRequestTotal).to.equal(expectedMatchesRequestTotal)

    testLogger.info('Asserting on Releases')
    const actualReleaseRequestManual = await pollForExpectedValue(
      () => getReleasesSummary(from, to),
      (data) => data.manual,
      expectedReleaseRequestManaul,
      15,
      2000
    )
    const actualReleaseRequestTotal = await pollForExpectedValue(
      () => getReleasesSummary(from, to),
      (data) => data.total,
      expectedReleaseRequestTotal
    )
    expect(actualReleaseRequestManual).to.equal(expectedReleaseRequestManaul)
    expect(actualReleaseRequestTotal).to.equal(expectedReleaseRequestTotal)

    testLogger.info('Asserting on Last Received')
    const updatedLastReceivedRequest = await getLastReceived()
    const updatedFinalisationTime = new Date(
      updatedLastReceivedRequest.finalisation.timestamp
    )
    const updatedRequestTime = new Date(
      updatedLastReceivedRequest.request.timestamp
    )
    const finalisationMrn = updatedLastReceivedRequest.finalisation.reference
    const requestMrn = updatedLastReceivedRequest.request.reference

    expect(updatedFinalisationTime.getTime()).to.be.greaterThan(
      finalisationTime.getTime()
    )
    expect(updatedRequestTime.getTime()).to.be.greaterThan(
      requestTime.getTime()
    )
    expect(finalisationMrn).to.equal(this.mrn)
    expect(requestMrn).to.equal(this.mrn)
  })
})

describe('BTMS sends a DecisionNotification for a Refusal decision on a MRN', function () {
  testCase('Description', async function () {
    newStep('Send initial IPAFFS notification')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: (testData.docRef = await generateDocumentReference()),
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    await waitForDataInAPI(testData.docRef, 'IPAFFS')

    newStep('Send Clearance Request')
    testData.existingDecisions = await getExistingDecisions(testData.mrn)

    const builder = new SoapMessageBuilder()

    await sendSoapRequest(
      SUBMIT_CLEARANCE_REQUEST_ENDPOINT,
      builder
        .addItem({
          TaricCommodityCode: '0103911000',
          Documents: [
            { DocumentCode: 'C640', DocumentReference: testData.docRef }
          ],
          Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
        })
        .buildMessage({
          mrn: (testData.mrn = generateRandomMRN())
        })
    )

    await waitForDataInAPI(testData.mrn)

    newStep('Wait for decision - should be a hold H01')

    let decisionXml = await waitForSpecificDecision(testData.mrn, 'H01')
    testLogger.info('Received decision with expected code H01')
    let codes = await extractDecisionCodes(decisionXml)
    testLogger.info('Received decision codes:', { decisionCodes: codes })

    newStep('Send updated IPAFFS notification with decision (refusal)')
    testData.existingDecisions = await getExistingDecisions(testData.mrn)

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: testData.docRef,
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

    await waitForDataInAPI(testData.docRef, 'IPAFFS', {
      importPreNotification: { version: 2 }
    })

    newStep('Wait for decision - should be a Refusal N04')
    decisionXml = await waitForSpecificDecision(testData.mrn, 'N04')
    testLogger.info('Received decision with expected code N04')
    codes = await extractDecisionCodes(decisionXml)
    testLogger.info('Received decision codes:', { decisionCodes: codes })
  })
})

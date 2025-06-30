describe('BTMS sends a DecisionNotification for a Refusal decision on a MRN', function () {
  testCase('Description', async function () {
    newStep('Send initial IPAFFS notification')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: (testData.docRef = generateDocumentReference()),
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
    const codes = await extractDecisionCodes(
      await waitForDecision(testData.mrn, testData.existingDecisions)
    )
    assert(codes.includes('H01'), 'Expected decision code H01 not found')

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

    newStep('Wait for decision - should be a Refusal N03')
    const finalCodes = await extractDecisionCodes(
      await waitForDecision(testData.mrn, testData.existingDecisions)
    )
    assert(finalCodes.includes('N04'), 'Expected decision code N04 not found')
  })
})

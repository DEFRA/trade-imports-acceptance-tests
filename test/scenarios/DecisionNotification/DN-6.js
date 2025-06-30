describe('BTMS sends a DecisionNotification where multiple items on a MRN have different decisions - DN-6', function () {
  it.skip('', async function () {
    this.timeout(70000)

    const docRef = generateDocumentReference()
    testLogger.info(docRef)

    const builder = new SoapMessageBuilder()

    for (let i = 0; i < 1; i++) {
      builder.addItem({
        TaricCommodityCode: i.toString().padStart(10, '0'),
        Document: {
          DocumentCode: 'N853',
          DocumentReference: docRef,
          DocumentStatus: 'AE',
          DocumentControl: 'P'
        }
      })
    }

    const mrn = generateRandomMRN()
    testLogger.info(mrn)
    const soapEnvelope = builder.buildMessage({
      mrn
    })
    // testLogger.info(soapEnvelope)

    const startTime1 = Date.now()

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)

    await sleep(5000)

    const json = `      {
        "referenceNumber": "${docRef}",
        "version": 1,
        "type": "CVEDA",
        "status": "SUBMITTED",
        "lastUpdated": "2025-05-14T10:15:31.130Z",
                "lastUpdatedBy": {
                "displayName": "Test Tester",
                "userId": "79f6dc68-2144-e911-a96a-000d3a29ba60"},
        "partTwo": {
         "decision": {
   
          },
        "inspectionRequired": "Not required"}
        }`

    const responseText = await waitForDecision(mrn, startTime1)
    const decisionCode = parseDecision(responseText)
    testLogger.info('Received decision codes:', { decisionCodes: decisionCode })

    assert.strictEqual(decisionCode, 'H01', 'Decision code does not match')

    sendIpaffsMessage(json)

    await sleep(5000)

    const json2 = `      {
            "referenceNumber": "${docRef}",
            "version": 5,
            "type": "CVEDA",
            "status": "SUBMITTED",
            "lastUpdated": "2025-05-14T10:15:31.131Z",
                    "lastUpdatedBy": {
                    "displayName": "Test Tester",
                    "userId": "79f6dc68-2144-e911-a96a-000d3a29ba60"},
            "partTwo": {
             "decision": {},
                    "inspectionRequired": "Required"
                    }
            }`

    sendIpaffsMessage(json2)

    await sleep(5000)
  })
})

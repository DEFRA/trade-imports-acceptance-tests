describe('BTMS sends a DecisionNotification for a Data Error decision on a MRN - DN-5', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info(
      'Send IPAFFS notification with decision (Data Error, Acceptable for Transit)',
      async () => {
        this.docRef = generateDocumentReference()

        sendIpaffsMessage(
          loadIPAFFSJson('CHEDA.json', {
            referenceNumber: this.docRef,
            lastUpdated: new Date().toISOString(),
            version: 2,
            status: 'VALIDATED',
            partTwo: {
              decision: {
                consignmentAcceptable: true,
                decision: 'Acceptable for Transit'
              },
              inspectionRequired: 'Not required'
            }
          })
        )
      }
    )

    testLogger.info('Send Clearance Request')
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
    testLogger.info('Wait for decision - should be a hold E03')
    const codes = await extractDecisionCodes(
      await waitForDecision(this.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', { decisionCodes: codes })
    assert(codes.includes('E03'), 'Expected decision code E03 not found')
  })
})

describe('BTMS sends a DecisionNotification for a Data Error decision on a MRN - DN-5', function () {
  this.timeout(70000)

  step(
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

  step('Send Clearance Request', async () => {
    const builder = new SoapMessageBuilder()

    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.build({
      mrn: this.mrn
    })

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
  })

  step('Wait for decision - should be a Data Error E03', async () => {
    const responseText = await waitForDecision(this.mrn, lastStartTime)
    const decisionCode = parseDecision(responseText)
    assert.strictEqual(decisionCode, 'E03', 'Decision code does not match')
  })
})

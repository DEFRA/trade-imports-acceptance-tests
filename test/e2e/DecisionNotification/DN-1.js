describe('BTMS sends a DecisionNotification for a Hold decision on a MRN - DN-1', function () {
  this.timeout(70000)
  step('Send initial IPAFFS notification', async () => {
    this.docRef = generateDocumentReference()

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
  })

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
    console.log('Sent clearance request')
  })

  step('Wait for decision - should be a hold H01', async () => {
    const responseText = await waitForDecision(this.mrn, lastStartTime)
    const decisionCode = parseDecision(responseText)
    assert.strictEqual(decisionCode, 'H01', 'Decision code does not match')
  })
})

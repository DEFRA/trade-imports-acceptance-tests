describe('BTMS sends a DecisionNotification for a No Match decision on a MRN - DN-4', function () {
  this.timeout(70000)

  step('Send Clearance Request', async () => {
    const builder = new SoapMessageBuilder()

    this.docRef = generateDocumentReference()

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
    console.log(soapEnvelope)
  })

  step('Wait for decision - should be a no match X00', async () => {
    const responseText = await waitForDecision(this.mrn, lastStartTime)
    const decisionCode = parseDecision(responseText)
    assert.strictEqual(decisionCode, 'X00', 'Decision code does not match')
  })
})

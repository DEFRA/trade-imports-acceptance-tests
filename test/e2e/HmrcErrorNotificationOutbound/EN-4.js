describe('BTMS receives a duplicate ClearanceRequest (same MRN, EntryVersionNumber, PreviousVersionNumber) - EN-4', function () {
  this.timeout(70000)
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
    console.log(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
  })

  step('Send the same Clearance Request again', async () => {
    const builder = new SoapMessageBuilder()

    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })

    const soapEnvelope = builder.build({
      mrn: this.mrn
    })
    console.log(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
  })

  step('Wait for error to be logged', async () => {
    const responseText = await waitForDataInAPI(this.mrn, 'ERROR')
    assert.ok(
      responseText.includes(
        `There is already a current import declaration in BTMS with EntryReference ${this.mrn}`
      ),
      'Expected duplicate mrn/EntryRefernce error'
    )
  })
})

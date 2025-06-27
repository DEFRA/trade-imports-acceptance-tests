describe('BTMS receives a duplicate ClearanceRequest (same MRN, EntryVersionNumber, PreviousVersionNumber) - EN-4', function () {
  it('should handle duplicate ClearanceRequest correctly', async function () {
    this.timeout(70000)
    // Send Clearance Request
    const builder1 = new SoapMessageBuilder()
    this.docRef = generateDocumentReference()
    builder1.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })
    this.mrn = generateRandomMRN()
    const soapEnvelope1 = builder1.buildMessage({
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope1)
    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope1)

    // Send the same Clearance Request again
    const builder2 = new SoapMessageBuilder()
    builder2.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })
    const soapEnvelope2 = builder2.buildMessage({
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope2)
    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope2)

    // Wait for error to be logged
    const responseText = await waitForDataInAPI(this.mrn, 'ERROR')
    assert.ok(
      responseText.includes(
        `There is already a current import declaration in BTMS with EntryReference ${this.mrn}`
      ),
      'Expected duplicate mrn/EntryRefernce error'
    )
  })
})

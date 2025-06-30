describe('BTMS receives a ClearanceRequest where the DocumentCode does not map to the CheckCode - EN-3', function () {
  it('', async function () {
    this.timeout(70000)
    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    this.documentCode = 'C640'
    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [
        {
          DocumentCode: this.documentCode,
          DocumentReference: generateDocumentReference()
        }
      ],
      Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }]
    })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.buildMessage({
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)

    const responseText = await waitForDataInAPI(this.mrn, 'ERROR')
    assert.ok(
      responseText.includes(
        `Document code ${this.documentCode} is not appropriate for the check code requested on ItemNumber 1`
      ),
      'Expected wrong Department Code error'
    )
  })
})

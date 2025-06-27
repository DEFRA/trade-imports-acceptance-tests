describe('BTMS receives a ClearanceRequest with many items. One item does not have a DocumentCode, a different item does not have CheckCode. - EN-6', function () {
  it('', async function () {
    this.timeout(70000)
    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    this.documentCode = 'C640'
    builder
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [
          { DocumentCode: this.documentCode, DocumentReference: this.docRef }
        ],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: null, DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [
          { DocumentCode: this.documentCode, DocumentReference: this.docRef }
        ],
        Checks: [{ CheckCode: null, DepartmentCode: 'AHVLA' }]
      })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.buildMessage({
      mrn: this.mrn
    })
    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)

    const responseText = await waitForDataInAPI(this.mrn, 'ERROR')

    const responseObj = JSON.parse(responseText)

    const notifications = responseObj.processingErrors
    assert(
      Array.isArray(notifications) && notifications.length > 0,
      'No notifications found'
    )

    const errors = notifications[0].errors
    assert(Array.isArray(errors), 'Errors field missing or not an array')

    function assertErrorWithParams(code, messageTemplate, params) {
      const expectedSubstring = messageTemplate.replace(
        /\{(\w+)\}/g,
        (_, key) => {
          return params[key] !== undefined ? params[key] : `{${key}}`
        }
      )

      const found = errors.find(
        (e) => e.code === code && e.message.includes(expectedSubstring)
      )
      assert(
        found,
        `Expected error with code ${code} and message containing "${expectedSubstring}"`
      )
    }

    assertErrorWithParams(
      'ALVSVAL308',
      'DocumentCode {documentCode} on item number {itemNumber} is invalid',
      { itemNumber: 2, documentCode: '' }
    )
    assertErrorWithParams(
      'ALVSVAL320',
      'Document code {documentCode} is not appropriate for the check code requested on ItemNumber {itemNumber}',
      { itemNumber: 2, documentCode: '' }
    )
    assertErrorWithParams(
      'ALVSVAL321',
      'Check code {checkCode} on ItemNumber {itemNumber} must have a document code',
      { itemNumber: 2, checkCode: 'H221' }
    )

    // Item 3
    assertErrorWithParams(
      'ALVSVAL311',
      'The CheckCode field on item number {itemNumber} must have a value',
      { itemNumber: 3 }
    )
    assertErrorWithParams(
      'ALVSVAL320',
      'Document code {documentCode} is not appropriate for the check code requested on ItemNumber {itemNumber}',
      { itemNumber: 3, documentCode: 'C640' }
    )
    assertErrorWithParams(
      'ALVSVAL321',
      'Check code {checkCode} on ItemNumber {itemNumber} must have a document code',
      { itemNumber: 3, checkCode: '' }
    )
  })
})

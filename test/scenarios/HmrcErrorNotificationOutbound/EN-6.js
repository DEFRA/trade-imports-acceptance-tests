describe('BTMS receives a ClearanceRequest with many items. One item does not have a DocumentCode, a different item does not have CheckCode. - EN-6', function () {
  it('should handle multiple validation errors correctly', async function () {
    this.timeout(70000)

    // Arrange: Set up test data
    this.documentCode = 'C640'
    this.docRef = generateDocumentReference()
    this.mrn = generateRandomMRN()

    // Act & Assert: Send clearance request with validation errors and expect multiple errors using fluent API
    await newFluentClearanceRequestTest()
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
      .withMRN(this.mrn)
      .sendFluent()
      .expectMultipleErrors([
        // Item 2 errors (missing DocumentCode)
        {
          code: 'ALVSVAL308',
          messageTemplate:
            'DocumentCode {documentCode} on item number {itemNumber} is invalid',
          params: { itemNumber: 2, documentCode: '' }
        },
        {
          code: 'ALVSVAL320',
          messageTemplate:
            'Document code {documentCode} is not appropriate for the check code requested on ItemNumber {itemNumber}',
          params: { itemNumber: 2, documentCode: '' }
        },
        {
          code: 'ALVSVAL321',
          messageTemplate:
            'Check code {checkCode} on ItemNumber {itemNumber} must have a document code',
          params: { itemNumber: 2, checkCode: 'H221' }
        },
        // Item 3 errors (missing CheckCode)
        {
          code: 'ALVSVAL311',
          messageTemplate:
            'The CheckCode field on item number {itemNumber} must have a value',
          params: { itemNumber: 3 }
        },
        {
          code: 'ALVSVAL320',
          messageTemplate:
            'Document code {documentCode} is not appropriate for the check code requested on ItemNumber {itemNumber}',
          params: { itemNumber: 3, documentCode: 'C640' }
        },
        {
          code: 'ALVSVAL321',
          messageTemplate:
            'Check code {checkCode} on ItemNumber {itemNumber} must have a document code',
          params: { itemNumber: 3, checkCode: '' }
        }
      ])
  })
})

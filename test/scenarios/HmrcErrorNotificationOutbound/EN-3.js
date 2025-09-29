describe('BTMS receives a ClearanceRequest where the DocumentCode does not map to the CheckCode - EN-3', function () {
  it('', async function () {
    this.timeout(70000)

    // Arrange: Set up test data
    this.documentCode = 'C640'
    this.expectedError = `Document code ${this.documentCode} is not appropriate for the check code requested on ItemNumber 1`

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [
          {
            DocumentCode: this.documentCode,
            DocumentReference: generateDocumentReference()
          }
        ],
        Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }]
      })
      .send()
      .expectError(this.expectedError, 'Expected wrong Department Code error')
  })
})

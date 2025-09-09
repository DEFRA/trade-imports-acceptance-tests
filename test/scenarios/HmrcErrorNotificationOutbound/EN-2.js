describe('BTMS receives a ClearanceRequest with no EntryVersionNumber - EN-2', function () {
  it('', async function () {
    this.timeout(70000)

    // Arrange: Set up test data
    this.documentCode = 'C640'
    this.correlationId = Math.floor(Math.random() * 1e12)

    await newFluentClearanceRequestTest()
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
      .withEntryVersionNumber(null)
      .withCorrelationId(this.correlationId)
      .sendFluent()
      .expectError({
        code: 'ALVSVAL153',
        messageTemplate:
          'EntryVersionNumber has not been provided for the import document. Provide an EntryVersionNumber. Your request with correlation ID {correlationId} has been terminated.',
        params: { correlationId: this.correlationId }
      })
  })
})

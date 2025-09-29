describe('BTMS receives a duplicate ClearanceRequest (same MRN, EntryVersionNumber, PreviousVersionNumber) - EN-4', function () {
  it('should handle duplicate ClearanceRequest correctly', async function () {
    this.timeout(70000)

    // Arrange: Set up test data
    this.docRef = await generateDocumentReference()
    this.mrn = generateRandomMRN()
    this.expectedError = `There is already a current import declaration in BTMS with EntryReference ${this.mrn}`

    // Act: Send first clearance request
    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .sendClearanceRequest()

    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .sendFluent()
      .expectError(
        this.expectedError,
        'Expected duplicate mrn/EntryRefernce error'
      )
  })
})

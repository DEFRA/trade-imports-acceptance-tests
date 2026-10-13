describe('BTMS holds a declaration against a submitted TRACES CHED with enough weight - TD-2', function () {
  it('', async function () {
    this.timeout(70000)

    this.mrn = generateRandomMRN()

    // Created without a status: the simulator makes it NEW, as TRACES does on submission.
    this.docRef = await tracesSimulator.createChed(
      Ched.chedA()
        .withDeclaration((d) => d.withClause('PURPOSE', 'FREE_CIRCULATION'))
        .withConsignment((c) =>
          c
            .withConsignor((p) => p.operator('770198').inCountry('XI'))
            .arrivingAt('GBBEL', 'XI')
            .withCommodity((i) =>
              i.cnCode('0101').originCountry('AF').netWeightKg(100)
            )
        )
    )
    await forceSyncAndWaitForDataInAPI(this.docRef, {
      ched: { exchangedDocument: { documentStatusCode: '1' } }
    })
    testLogger.info('✓ Submitted TRACES CHED reached BTMS')

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0101210000',
        ItemNetMass: '90',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H221', 'H02')
      })
  })
})

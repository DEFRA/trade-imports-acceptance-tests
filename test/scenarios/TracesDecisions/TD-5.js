describe('BTMS refuses a second declaration once the first has used all of a TRACES CHED quantity - TD-5', function () {
  it('', async function () {
    this.timeout(70000)

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

    await tracesSimulator.patchChed(
      this.docRef,
      Ched.chedA()
        .withStatus('VALIDATED')
        .withClearance((c) => c.acceptable())
    )
    await forceSyncAndWaitForDataInAPI(this.docRef, {
      ched: { exchangedDocument: { documentStatusCode: '70' } }
    })
    testLogger.info('✓ Validated TRACES CHED reached BTMS')

    const declareAgainstChed = (netMassKg) =>
      newClearanceRequest()
        .addItem({
          TaricCommodityCode: '0101210000',
          ItemNetMass: netMassKg,
          Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
          Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
        })
        .withMRN(generateRandomMRN())
        .withEntryVersionNumber(1)
        .sendClearanceRequest()

    testLogger.info('First declaration reserves all 100 kg')
    await declareAgainstChed('100').then((test) =>
      test.waitForCheckDecision('H221', 'C03')
    )

    // Each declaration fits the CHED on its own (Level 3), but the reservation in TRACES (Level 4)
    // fails with nothing left: X00, internal code E43 (quantities insufficient).
    testLogger.info('Second declaration finds nothing left to reserve')
    await declareAgainstChed('50').then((test) =>
      test.waitForCheckDecision('H221', 'X00')
    )
  })
})

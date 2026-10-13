// Needs the deriver's TRACES quantity check in Live mode (DecisionRules__Traces__Level3Mode,
// set in btms-local-environment's compose.tgp.yml). In the default DryRun mode the check releases (C03).
describe('BTMS does not release a declaration that weighs more than its validated TRACES CHED - TD-3', function () {
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

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0101210000',
        ItemNetMass: '150',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H221', 'X00')
      })
  })
})

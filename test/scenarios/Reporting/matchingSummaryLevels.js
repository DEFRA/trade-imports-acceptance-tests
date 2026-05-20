describe('Reporting Matching Summary Levels', function () {
  it('should update matching summary levels', async function () {
    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    const allSummaryLevels = await getMatchingLevels(from, to)
    const initialSummaryLevelOne = allSummaryLevels.level1
    const initialSummaryLevelTwo = allSummaryLevels.level2
    const initialSummaryLevelThree = allSummaryLevels.level3
    const initialSummaryLevelTotal = allSummaryLevels.total

    testLogger.info(`Initial Summary Levels at No Match: `, {
      initialSummaryLevelOne,
      initialSummaryLevelTwo,
      initialSummaryLevelThree,
      initialSummaryLevelTotal
    })

    const docRef = await generateDocumentReference()
    const mrn = generateRandomMRN()

    testLogger.info('Sending Clearance Request for Mo Match')
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911001',
        ItemNetMass: 500,
        ItemSupplementaryUnits: 500,
        Documents: [{ DocumentCode: 'C640', DocumentReference: docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForDecision('X00')
      })

    const firstAllSummaryLevels = await waitForLevelsChange(
      allSummaryLevels,
      () => getMatchingLevels(from, to)
    )

    testLogger.info('Asserting Summary Levels after No Match')
    const firstUpdateSummaryLevelOne = firstAllSummaryLevels.level1
    const firstUpdateSummaryLevelTwo = firstAllSummaryLevels.level2
    const firstUpdateSummaryLevelThree = firstAllSummaryLevels.level3
    const firstUpdateSummaryTotal = await pollForExpectedValue(
      () => getMatchingLevels(from, to),
      (data) => firstAllSummaryLevels.total,
      initialSummaryLevelTotal + 1
    )

    expect(firstUpdateSummaryLevelOne).to.be.greaterThanOrEqual(
      initialSummaryLevelOne
    )
    expect(firstUpdateSummaryLevelTwo).to.greaterThanOrEqual(
      initialSummaryLevelTwo
    )
    expect(firstUpdateSummaryLevelThree).to.be.greaterThanOrEqual(
      initialSummaryLevelThree
    )
    expect(firstUpdateSummaryTotal).to.be.greaterThanOrEqual(
      initialSummaryLevelTotal
    )

    const firstMatchesDataWithoutWithoutV2 = await getDataMatches(from, to)
    const firstMatchesDataWithoutWithV2 = await getDataMatches(from, to, true)

    testLogger.info('firstMatchesDataWithoutWithoutV2: ', {
      firstMatchesDataWithoutWithoutV2
    })
    testLogger.info('firstMatchesDataWithoutWithV2: ', {
      firstMatchesDataWithoutWithV2
    })

    expect(firstMatchesDataWithoutWithoutV2.data[0]).to.include({
      reference: mrn
    })

    expect(firstMatchesDataWithoutWithV2.data[0]).to.include({
      mrn,
      itemNumber: 1,
      commodityCode: '0103911001',
      checkCode: 'H221',
      quantityOrWeight: 500,
      chedReference: docRef,
      match: 'No',
      authority: 'AHVLA',
      decision: 'X00',
      level: 1,
      mode: 'Active',
      dispatchCountryCode: 'CN',
      declarantId: 'GB123456789013'
    })

    testLogger.info('Sending CHED-A to match at Level 1')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRef,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '0105',
                commodityDescription: 'Live horses, asses, mules and hinnies',
                complementID: 1,
                complementName: 'Equus asinus',
                speciesID: '242089',
                speciesName: 'Equus asinus',
                speciesType: '2',
                speciesClass: '147603',
                speciesNomination: 'Equus asinus'
              }
            ],
            complementParameterSet: [
              {
                uniqueComplementID: '65b5bb8e-5b2c-4f76-ade0-472e1836c4ac',
                complementID: 1,
                speciesID: '242089',
                keyDataPair: [
                  {
                    key: 'number_package',
                    data: '1000'
                  },
                  {
                    key: 'netweight',
                    data: '1000'
                  }
                ],
                identifiers: [
                  {
                    speciesNumber: 1,
                    data: {
                      microchip: '1',
                      passport: '2'
                    }
                  }
                ]
              }
            ]
          }
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    await waitForSpecificDecision(mrn, 'H01')

    testLogger.info('Asserting Summary Levels after Level 1 Match')
    const secondAllSummaryLevels = await waitForLevelsChange(
      firstAllSummaryLevels,
      () => getMatchingLevels(from, to)
    )
    const secondUpdateSummaryLevelOne = await pollForExpectedValue(
      () => getMatchingLevels(from, to),
      (data) => secondAllSummaryLevels.level1,
      initialSummaryLevelOne + 1
    )
    const secondUpdateSummaryLevelTwo = secondAllSummaryLevels.level2
    const secondUpdateSummaryLevelThree = secondAllSummaryLevels.level3
    const secondUpdateSummaryTotal = secondAllSummaryLevels.total

    expect(secondUpdateSummaryLevelOne).to.be.greaterThan(
      firstUpdateSummaryLevelOne
    )
    expect(secondUpdateSummaryLevelTwo).to.equal(firstUpdateSummaryLevelTwo)
    expect(secondUpdateSummaryLevelThree).to.equal(firstUpdateSummaryLevelThree)
    expect(secondUpdateSummaryTotal).to.equal(firstUpdateSummaryTotal)

    const secondMatchesDataWithoutWithoutV2 = await getDataMatches(from, to)
    const secondMatchesDataWithoutWithV2 = await getDataMatches(from, to, true)

    testLogger.info('secondMatchesDataWithoutWithoutV2: ', {
      secondMatchesDataWithoutWithoutV2
    })
    testLogger.info('secondMatchesDataWithoutWithV2: ', {
      secondMatchesDataWithoutWithV2
    })

    expect(secondMatchesDataWithoutWithoutV2).to.have.property('data')
    expect(secondMatchesDataWithoutWithoutV2.data).to.have.lengthOf(0)

    expect(secondMatchesDataWithoutWithV2.data[0]).to.include({
      mrn,
      itemNumber: 1,
      commodityCode: '0103911001',
      checkCode: 'H221',
      quantityOrWeight: 500,
      chedReference: docRef,
      match: 'Yes',
      authority: 'AHVLA',
      decision: 'H01',
      level: 1,
      mode: 'Active',
      dispatchCountryCode: 'CN',
      declarantId: 'GB123456789013'
    })

    expect(secondMatchesDataWithoutWithV2.data[1]).to.include({
      mrn,
      itemNumber: 1,
      commodityCode: '0103911001',
      checkCode: 'H221',
      quantityOrWeight: 500,
      chedReference: docRef,
      match: 'No',
      authority: 'AHVLA',
      decision: 'X00',
      level: 2,
      mode: 'Passive',
      dispatchCountryCode: 'CN',
      declarantId: 'GB123456789013'
    })

    testLogger.info('Updating CHED-A to match at Level 2')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRef,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '0103911001',
                commodityDescription: 'Live horses, asses, mules and hinnies',
                complementID: 1,
                complementName: 'Equus asinus',
                speciesID: '242089',
                speciesName: 'Equus asinus',
                speciesType: '2',
                speciesClass: '147603',
                speciesNomination: 'Equus asinus'
              }
            ],
            complementParameterSet: [
              {
                uniqueComplementID: '65b5bb8e-5b2c-4f76-ade0-472e1836c4ac',
                complementID: 1,
                speciesID: '242089',
                keyDataPair: [
                  {
                    key: 'number_package',
                    data: '1000'
                  },
                  {
                    key: 'netweight',
                    data: '1000'
                  }
                ],
                identifiers: [
                  {
                    speciesNumber: 1,
                    data: {
                      microchip: '1',
                      passport: '2'
                    }
                  }
                ]
              }
            ]
          }
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    await waitForSpecificDecision(mrn, 'H01')

    testLogger.info('Asserting Summary Levels after Level 2 Match')
    const thirdAllSummaryLevels = await waitForLevelsChange(
      secondAllSummaryLevels,
      () => getMatchingLevels(from, to)
    )
    const thirdUpdateSummaryLevelOne = thirdAllSummaryLevels.level1
    const thirdUpdateSummaryLevelTwo = await pollForExpectedValue(
      () => getMatchingLevels(from, to),
      (data) => thirdAllSummaryLevels.level2,
      initialSummaryLevelTwo + 1
    )
    const thirdUpdateSummaryLevelThree = thirdAllSummaryLevels.level3
    const thirdUpdateSummaryTotal = thirdAllSummaryLevels.total

    expect(thirdUpdateSummaryLevelOne).to.equal(secondUpdateSummaryLevelOne)
    expect(thirdUpdateSummaryLevelTwo).to.be.greaterThan(
      secondUpdateSummaryLevelTwo
    )
    expect(thirdUpdateSummaryLevelThree).to.equal(secondUpdateSummaryLevelThree)
    expect(thirdUpdateSummaryTotal).to.equal(secondUpdateSummaryTotal)

    const thirdMatchesDataWithoutWithoutV2 = await getDataMatches(from, to)
    const thirdMatchesDataWithoutWithV2 = await getDataMatches(from, to, true)

    testLogger.info('thirdMatchesDataWithoutWithoutV2: ', {
      thirdMatchesDataWithoutWithoutV2
    })
    testLogger.info('thirdMatchesDataWithoutWithV2: ', {
      thirdMatchesDataWithoutWithV2
    })

    expect(thirdMatchesDataWithoutWithoutV2).to.have.property('data')
    expect(thirdMatchesDataWithoutWithoutV2.data).to.have.lengthOf(0)

    expect(thirdMatchesDataWithoutWithV2.data[0]).to.include({
      mrn,
      itemNumber: 1,
      commodityCode: '0103911001',
      checkCode: 'H221',
      quantityOrWeight: 500,
      chedReference: docRef,
      match: 'Yes',
      authority: 'AHVLA',
      decision: 'H01',
      level: 1,
      mode: 'Active',
      dispatchCountryCode: 'CN',
      declarantId: 'GB123456789013'
    })

    expect(thirdMatchesDataWithoutWithV2.data[1]).to.include({
      mrn,
      itemNumber: 1,
      commodityCode: '0103911001',
      checkCode: 'H221',
      quantityOrWeight: 500,
      chedReference: docRef,
      match: 'No',
      authority: 'AHVLA',
      decision: 'X00',
      level: 3,
      mode: 'Passive',
      dispatchCountryCode: 'CN',
      declarantId: 'GB123456789013'
    })

    testLogger.info('Updating CHED-A to match Level 3')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRef,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '0103911001',
                commodityDescription: 'Live horses, asses, mules and hinnies',
                complementID: 1,
                complementName: 'Equus asinus',
                speciesID: '242089',
                speciesName: 'Equus asinus',
                speciesType: '2',
                speciesClass: '147603',
                speciesNomination: 'Equus asinus'
              }
            ],
            complementParameterSet: [
              {
                uniqueComplementID: '65b5bb8e-5b2c-4f76-ade0-472e1836c4ac',
                complementID: 1,
                speciesID: '242089',
                keyDataPair: [
                  {
                    key: 'number_package',
                    data: '400'
                  },
                  {
                    key: 'netweight',
                    data: '400'
                  }
                ],
                identifiers: [
                  {
                    speciesNumber: 1,
                    data: {
                      microchip: '1',
                      passport: '2'
                    }
                  }
                ]
              }
            ]
          }
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    await waitForSpecificDecision(mrn, 'H01')

    testLogger.info('Asserting Summary Levels after Level 3 Match')
    const finalAllSummaryLevels = await waitForLevelsChange(
      thirdAllSummaryLevels,
      () => getMatchingLevels(from, to)
    )
    const finalUpdateSummaryLevelOne = finalAllSummaryLevels.level1
    const finalUpdateSummaryLevelTwo = finalAllSummaryLevels.level2
    const finalUpdateSummaryLevelThree = await pollForExpectedValue(
      () => getMatchingLevels(from, to),
      (data) => finalAllSummaryLevels.level3,
      initialSummaryLevelThree + 1
    )
    const finalUpdateSummaryTotal = finalAllSummaryLevels.total

    expect(finalUpdateSummaryLevelOne).to.equal(thirdUpdateSummaryLevelOne)
    expect(finalUpdateSummaryLevelTwo).to.equal(thirdUpdateSummaryLevelTwo)
    expect(finalUpdateSummaryLevelThree).to.be.greaterThan(
      thirdUpdateSummaryLevelThree
    )
    expect(finalUpdateSummaryTotal).to.equal(thirdUpdateSummaryTotal)

    const finalMatchesDataWithoutWithoutV2 = await getDataMatches(from, to)
    const finalMatchesDataWithoutWithV2 = await getDataMatches(from, to, true)

    testLogger.info('finalMatchesDataWithoutWithoutV2: ', {
      finalMatchesDataWithoutWithoutV2
    })
    testLogger.info('finalMatchesDataWithoutWithV2: ', {
      finalMatchesDataWithoutWithV2
    })

    expect(finalMatchesDataWithoutWithoutV2).to.have.property('data')
    expect(finalMatchesDataWithoutWithoutV2.data).to.have.lengthOf(0)

    expect(finalMatchesDataWithoutWithV2).to.have.property('data')
    expect(finalMatchesDataWithoutWithV2.data).to.have.lengthOf(0)
  })
})

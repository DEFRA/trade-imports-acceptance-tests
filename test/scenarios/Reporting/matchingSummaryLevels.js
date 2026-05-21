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
    const filterWithoutV2ByMrn = (response) =>
      response.data.filter((entry) => entry.reference === mrn)
    const filterWithV2ByMrn = (response) =>
      response.data.filter((entry) => entry.mrn === mrn)

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

    const firstNoMatchesDataWithoutV2 = await getDataMatches(from, to)
    const firstNoMatchesDataWithV2 = await getDataMatches(from, to, true)

    testLogger.info('firstNoMatchesDataWithoutV2: ', {
      firstNoMatchesDataWithoutV2
    })
    testLogger.info('firstNoMatchesDataWithV2: ', {
      firstNoMatchesDataWithV2
    })

    const firstNoMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      firstNoMatchesDataWithoutV2
    )
    const firstNoMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      firstNoMatchesDataWithV2
    )

    expect(firstNoMatchesDataWithoutV2ForMrn).to.have.lengthOf(1)
    expect(firstNoMatchesDataWithoutV2ForMrn[0]).to.include({
      reference: mrn
    })

    expect(firstNoMatchesDataWithV2ForMrn).to.have.lengthOf(1)
    expect(firstNoMatchesDataWithV2ForMrn[0]).to.include({
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

    const firstMatchesDataWithoutV2 = await getDataMatches(
      from,
      to,
      false,
      true
    )
    const firstMatchesDataWithV2 = await getDataMatches(from, to, true, true)

    testLogger.info('firstMatchesDataWithoutV2: ', {
      firstMatchesDataWithoutV2
    })
    testLogger.info('firstMatchesDataWithV2: ', {
      firstMatchesDataWithV2
    })

    const firstMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      firstMatchesDataWithoutV2
    )
    const firstMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      firstMatchesDataWithV2
    )

    expect(firstMatchesDataWithoutV2ForMrn).to.have.lengthOf(0)
    expect(firstMatchesDataWithV2ForMrn).to.have.lengthOf(0)

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

    const secondNoMatchesDataWithoutV2 = await getDataMatches(from, to)
    const secondNoMatchesDataWithV2 = await getDataMatches(from, to, true)

    testLogger.info('secondNoMatchesDataWithoutV2: ', {
      secondNoMatchesDataWithoutV2
    })
    testLogger.info('secondNoMatchesDataWithV2: ', {
      secondNoMatchesDataWithV2
    })

    const secondNoMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      secondNoMatchesDataWithoutV2
    )
    const secondNoMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      secondNoMatchesDataWithV2
    )

    expect(secondNoMatchesDataWithoutV2ForMrn).to.have.lengthOf(0)

    expect(secondNoMatchesDataWithV2ForMrn).to.have.lengthOf(2)
    expect(secondNoMatchesDataWithV2ForMrn[0]).to.include({
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
    expect(secondNoMatchesDataWithV2ForMrn[1]).to.include({
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

    const secondMatchesDataWithoutV2 = await getDataMatches(
      from,
      to,
      false,
      true
    )
    const secondMatchesDataWithV2 = await getDataMatches(from, to, true, true)

    testLogger.info('secondMatchesDataWithoutV2: ', {
      secondMatchesDataWithoutV2
    })
    testLogger.info('secondMatchesDataWithV2: ', {
      secondMatchesDataWithV2
    })

    const secondMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      secondMatchesDataWithoutV2
    )
    const secondMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      secondMatchesDataWithV2
    )

    expect(secondMatchesDataWithoutV2ForMrn).to.have.lengthOf(1)
    expect(secondMatchesDataWithoutV2ForMrn[0]).to.include({
      reference: mrn
    })

    expect(secondMatchesDataWithV2ForMrn).to.have.lengthOf(0)

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

    const thirdNoMatchesDataWithoutV2 = await getDataMatches(from, to)
    const thirdNoMatchesDataWithV2 = await getDataMatches(from, to, true)

    testLogger.info('thirdNoMatchesDataWithoutV2: ', {
      thirdNoMatchesDataWithoutV2
    })
    testLogger.info('thirdNoMatchesDataWithV2: ', {
      thirdNoMatchesDataWithV2
    })

    const thirdNoMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      thirdNoMatchesDataWithoutV2
    )
    const thirdNoMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      thirdNoMatchesDataWithV2
    )

    expect(thirdNoMatchesDataWithoutV2ForMrn).to.have.lengthOf(0)

    expect(thirdNoMatchesDataWithV2ForMrn).to.have.lengthOf(2)
    expect(thirdNoMatchesDataWithV2ForMrn[0]).to.include({
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
    expect(thirdNoMatchesDataWithV2ForMrn[1]).to.include({
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

    const thirdMatchesDataWithoutV2 = await getDataMatches(
      from,
      to,
      false,
      true
    )
    const thirdMatchesDataWithV2 = await getDataMatches(from, to, true, true)

    testLogger.info('thirdMatchesDataWithoutV2: ', {
      thirdMatchesDataWithoutV2
    })
    testLogger.info('thirdMatchesDataWithV2: ', {
      thirdMatchesDataWithV2
    })

    const thirdMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      thirdMatchesDataWithoutV2
    )
    const thirdMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      thirdMatchesDataWithV2
    )

    expect(thirdMatchesDataWithoutV2ForMrn).to.have.lengthOf(1)
    expect(thirdMatchesDataWithoutV2ForMrn[0]).to.include({
      reference: mrn
    })

    expect(thirdMatchesDataWithV2ForMrn).to.have.lengthOf(0)

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

    const finalNoMatchesDataWithoutV2 = await getDataMatches(from, to)
    const finalNoMatchesDataWithV2 = await getDataMatches(from, to, true)

    testLogger.info('finalNoMatchesDataWithoutV2: ', {
      finalNoMatchesDataWithoutV2
    })
    testLogger.info('finalNoMatchesDataWithV2: ', {
      finalNoMatchesDataWithV2
    })

    const finalNoMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      finalNoMatchesDataWithoutV2
    )
    const finalNoMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      finalNoMatchesDataWithV2
    )

    expect(finalNoMatchesDataWithoutV2ForMrn).to.have.lengthOf(0)
    expect(finalNoMatchesDataWithV2ForMrn).to.have.lengthOf(0)

    const finalMatchesDataWithoutV2 = await getDataMatches(
      from,
      to,
      false,
      true
    )
    const finalMatchesDataWithV2 = await getDataMatches(from, to, true, true)

    testLogger.info('finalMatchesDataWithoutV2: ', {
      finalMatchesDataWithoutV2
    })
    testLogger.info('finalMatchesDataWithV2: ', {
      finalMatchesDataWithV2
    })

    const finalMatchesDataWithoutV2ForMrn = filterWithoutV2ByMrn(
      finalMatchesDataWithoutV2
    )
    const finalMatchesDataWithV2ForMrn = filterWithV2ByMrn(
      finalMatchesDataWithV2
    )

    expect(finalMatchesDataWithoutV2ForMrn).to.have.lengthOf(1)
    expect(finalMatchesDataWithoutV2ForMrn[0]).to.include({
      reference: mrn
    })

    expect(finalMatchesDataWithV2ForMrn).to.have.lengthOf(1)
    expect(finalMatchesDataWithV2ForMrn[0]).to.include({
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
  })
})

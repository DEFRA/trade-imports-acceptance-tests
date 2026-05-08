describe('Reporting Matching Summary Levels', function () {
  it('should update matching summary levels', async function () {
    // Test Set-up

    testLogger.info('Getting initial /summary/levels`')
    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    testLogger.info('From and To dates: ', { fromDate: from, toDate: to })
    const allSummaryLevels = await getMatchingLevels(from, to)
    const initialSummaryLevelOne = allSummaryLevels.level1
    const initialSummaryLevelTwo = allSummaryLevels.level2
    const initialSummaryLevelThree = allSummaryLevels.level3
    const initialSummaryLevelTotal = allSummaryLevels.total

    testLogger.info(`Initial Summary Levels: `, {
      initialSummaryLevelOne,
      initialSummaryLevelTwo,
      initialSummaryLevelThree,
      initialSummaryLevelTotal
    })

    const docRef = await generateDocumentReference()
    const mrn = generateRandomMRN()

    testLogger.info('Summary Level for Total Count but no matches')
    testLogger.info('Sending Clearance request')

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
    await sleep(5000)

    const firstAllSummaryLevels = await getMatchingLevels(from, to)
    const firstUpdateSummaryLevelOne = firstAllSummaryLevels.level1
    const firstUpdateSummaryLevelTwo = firstAllSummaryLevels.level2
    const firstUpdateSummaryLevelThree = firstAllSummaryLevels.level3
    const firstUpdateSummaryTotal = await pollForExpectedValue(
      () => getMatchingLevels(from, to),
      (data) => firstAllSummaryLevels.total,
      initialSummaryLevelTotal + 1
    )

    expect(firstUpdateSummaryLevelOne).to.equal(initialSummaryLevelTotal)
    expect(firstUpdateSummaryLevelTwo).to.equal(initialSummaryLevelTotal)
    expect(firstUpdateSummaryLevelThree).to.equal(initialSummaryLevelTotal)
    expect(firstUpdateSummaryTotal).to.be.greaterThan(initialSummaryLevelTotal)

    // Performing a Level 1 Match

    testLogger.info('Summary Level for Level 1 Match')
    testLogger.info('Sending CHED-A')
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
    await sleep(5000)

    const secondAllSummaryLevels = await getMatchingLevels(from, to)
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

    // Performing a Level 2 Match

    testLogger.info('Summary Level for Level 2 Match')
    testLogger.info('Sending CHED-A')
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
    await sleep(5000)

    testLogger.info('Level 2 should increment now')
    const thirdAllSummaryLevels = await getMatchingLevels(from, to)
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

    // Performing a Level 3 Match

    testLogger.info('Summary Level for Level 2 Match')
    testLogger.info('Sending CHED-A')
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
    await sleep(5000)

    const finalAllSummaryLevels = await getMatchingLevels(from, to)
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
  })
})

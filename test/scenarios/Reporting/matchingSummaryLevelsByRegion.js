describe('Reporting Matching Summary Levels by Region', function () {
  it('should update region levels', async function () {
    this.timeout(5 * 60 * 1000)

    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    const allRegion = await getMatchingLevelsByRegion(from, to)

    const allRegionTotal = allRegion.total
    const allRegionEuTotal = allRegion.eu.total

    const allRegionEuMatchLevel1 = allRegion.eu.match.level1
    const allRegionEuMatchLevel2 = allRegion.eu.match.level2
    const allRegionEuMatchLevel3 = allRegion.eu.match.level3
    const allRegionEuNoMatchLevel1 = allRegion.eu.noMatch.level1
    const allRegionEuNoMatchLevel2 = allRegion.eu.noMatch.level2
    const allRegionEuNoMatchLevel3 = allRegion.eu.noMatch.level3

    testLogger.info(`Initial Region Levels at No Match: `, {
      allRegionTotal,
      allRegionEuTotal,
      allRegionEuMatchLevel1,
      allRegionEuMatchLevel2,
      allRegionEuMatchLevel3,
      allRegionEuNoMatchLevel1,
      allRegionEuNoMatchLevel2,
      allRegionEuNoMatchLevel3
    })

    const mrnInsideEu = generateRandomMRN()
    const docRefInsideEu = await generateDocumentReference()

    testLogger.info(`Inside EU MRN and DocRef: `, {
      mrnInsideEu,
      docRefInsideEu
    })

    testLogger.info('NO MATCH LEVEL 1')
    testLogger.info('Sending Clearance Request for Mo Match inside EU')
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '1601009105',
        ItemNetMass: 500,
        Documents: [
          { DocumentCode: 'C640', DocumentReference: docRefInsideEu }
        ],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(mrnInsideEu)
      .withEntryVersionNumber(1)
      .withDispatchCountryCode('IT')
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForDecision('X00')
      })

    const firstRegion = await waitForLevelsByRegionChange(allRegion, () =>
      getMatchingLevelsByRegion(from, to)
    )

    const firstRegionTotal = firstRegion.total
    const firstRegionEuTotal = firstRegion.eu.total

    const firstRegionEuMatchLevel1 = firstRegion.eu.match.level1
    const firstRegionEuMatchLevel2 = firstRegion.eu.match.level2
    const firstRegionEuMatchLevel3 = firstRegion.eu.match.level3

    const firstRegionEuNoMatchLevel1 = firstRegion.eu.noMatch.level1
    const firstRegionEuNoMatchLevel2 = firstRegion.eu.noMatch.level2
    const firstRegionEuNoMatchLevel3 = firstRegion.eu.noMatch.level3

    testLogger.info(`Region Levels after sending Custom Declarations: `, {
      firstRegionTotal,
      firstRegionEuTotal,
      firstRegionEuMatchLevel1,
      firstRegionEuMatchLevel2,
      firstRegionEuMatchLevel3,
      firstRegionEuNoMatchLevel1,
      firstRegionEuNoMatchLevel2,
      firstRegionEuNoMatchLevel3
    })

    // Total Checks
    expect(firstRegionTotal).to.be.greaterThanOrEqual(allRegionTotal)
    expect(firstRegionEuTotal).to.be.greaterThanOrEqual(allRegionEuTotal)

    // Match Checks
    expect(firstRegionEuMatchLevel1).to.be.equal(allRegionEuMatchLevel1)
    expect(firstRegionEuMatchLevel2).to.be.equal(allRegionEuMatchLevel2)
    expect(firstRegionEuMatchLevel3).to.be.equal(allRegionEuMatchLevel3)

    // No Match Checks
    expect(firstRegionEuNoMatchLevel1).to.be.greaterThanOrEqual(
      allRegionEuNoMatchLevel1
    )
    expect(firstRegionEuNoMatchLevel2).to.be.equal(allRegionEuNoMatchLevel2)
    expect(firstRegionEuNoMatchLevel3).to.be.equal(allRegionEuNoMatchLevel3)

    testLogger.info('MATCH LEVEL 1, NO MATCH LEVEL 2')
    testLogger.info('Sending CHED-A to match at Level 1 for Inside EU')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRefInsideEu,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '1010',
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
    await waitForSpecificDecision(mrnInsideEu, 'H01')

    const secondRegion = await waitForLevelsByRegionChange(firstRegion, () =>
      getMatchingLevelsByRegion(from, to)
    )

    const secondRegionTotal = secondRegion.total
    const secondRegionEuTotal = secondRegion.eu.total

    const secondRegionEuMatchLevel1 = secondRegion.eu.match.level1
    const secondRegionEuMatchLevel2 = secondRegion.eu.match.level2
    const secondRegionEuMatchLevel3 = secondRegion.eu.match.level3

    const secondRegionEuNoMatchLevel1 = secondRegion.eu.noMatch.level1
    const secondRegionEuNoMatchLevel2 = secondRegion.eu.noMatch.level2
    const secondRegionEuNoMatchLevel3 = secondRegion.eu.noMatch.level3

    testLogger.info(`Region Levels after sending CHEDs: `, {
      secondRegionTotal,
      secondRegionEuTotal,
      secondRegionEuMatchLevel1,
      secondRegionEuMatchLevel2,
      secondRegionEuMatchLevel3,
      secondRegionEuNoMatchLevel1,
      secondRegionEuNoMatchLevel2,
      secondRegionEuNoMatchLevel3
    })

    // Total Checks
    expect(secondRegionTotal).to.be.greaterThanOrEqual(firstRegionTotal)
    expect(secondRegionEuTotal).to.be.greaterThanOrEqual(firstRegionEuTotal)

    // Match Checks
    expect(secondRegionEuMatchLevel1).to.be.greaterThan(
      firstRegionEuMatchLevel1
    )
    expect(secondRegionEuMatchLevel2).to.be.equal(firstRegionEuMatchLevel2)
    expect(secondRegionEuMatchLevel3).to.be.equal(firstRegionEuMatchLevel3)

    // No Match Checks
    expect(secondRegionEuNoMatchLevel1).to.be.lessThan(
      firstRegionEuNoMatchLevel1
    )
    expect(secondRegionEuNoMatchLevel2).to.be.greaterThan(
      firstRegionEuNoMatchLevel2
    )
    expect(secondRegionEuNoMatchLevel3).to.be.equal(firstRegionEuNoMatchLevel3)

    testLogger.info('MATCH LEVEL 1, AND LEVEL 2, NO MATCH LEVEL 3')
    testLogger.info('Updating CHED-A to match at Level 2 for Inside EU')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRefInsideEu,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '1601009105',
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
    await waitForSpecificDecision(mrnInsideEu, 'H01')

    const thirdRegion = await waitForLevelsByRegionChange(secondRegion, () =>
      getMatchingLevelsByRegion(from, to)
    )

    const thirdRegionTotal = thirdRegion.total
    const thirdRegionEuTotal = thirdRegion.eu.total

    const thirdRegionEuMatchLevel1 = thirdRegion.eu.match.level1
    const thirdRegionEuMatchLevel2 = thirdRegion.eu.match.level2
    const thirdRegionEuMatchLevel3 = thirdRegion.eu.match.level3

    const thirdRegionEuNoMatchLevel1 = thirdRegion.eu.noMatch.level1
    const thirdRegionEuNoMatchLevel2 = thirdRegion.eu.noMatch.level2
    const thirdRegionEuNoMatchLevel3 = thirdRegion.eu.noMatch.level3

    testLogger.info(`Region Levels after updating CHED with commodity: `, {
      thirdRegionTotal,
      thirdRegionEuTotal,
      thirdRegionEuMatchLevel1,
      thirdRegionEuMatchLevel2,
      thirdRegionEuMatchLevel3,
      thirdRegionEuNoMatchLevel1,
      thirdRegionEuNoMatchLevel2,
      thirdRegionEuNoMatchLevel3
    })

    // Total Checks
    expect(thirdRegionTotal).to.be.greaterThanOrEqual(secondRegionTotal)
    expect(thirdRegionEuTotal).to.be.greaterThanOrEqual(secondRegionEuTotal)

    // Match Checks
    expect(thirdRegionEuMatchLevel1).to.be.equal(secondRegionEuMatchLevel1)
    expect(thirdRegionEuMatchLevel2).to.be.greaterThan(
      secondRegionEuMatchLevel2
    )
    expect(thirdRegionEuMatchLevel3).to.be.equal(secondRegionEuMatchLevel3)

    // No Match Checks
    expect(thirdRegionEuNoMatchLevel1).to.be.equal(secondRegionEuNoMatchLevel1)
    expect(thirdRegionEuNoMatchLevel2).to.be.lessThan(
      secondRegionEuNoMatchLevel2
    )
    expect(thirdRegionEuNoMatchLevel3).to.be.greaterThan(
      secondRegionEuNoMatchLevel3
    )

    testLogger.info('MATCH LEVEL 1, LEVEL 2, AND LEVEL 3')
    testLogger.info('Updating CHED-A to match Level 3')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: docRefInsideEu,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '1601009105',
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
                    key: 'netweight',
                    data: '500'
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
    await waitForSpecificDecision(mrnInsideEu, 'H01')

    const finalRegion = await waitForLevelsByRegionChange(thirdRegion, () =>
      getMatchingLevelsByRegion(from, to)
    )

    const finalRegionTotal = finalRegion.total
    const finalRegionEuTotal = finalRegion.eu.total

    const finalRegionEuMatchLevel1 = finalRegion.eu.match.level1
    const finalRegionEuMatchLevel2 = finalRegion.eu.match.level2
    const finalRegionEuMatchLevel3 = finalRegion.eu.match.level3

    const finalRegionEuNoMatchLevel1 = finalRegion.eu.noMatch.level1
    const finalRegionEuNoMatchLevel2 = finalRegion.eu.noMatch.level2
    const finalRegionEuNoMatchLevel3 = finalRegion.eu.noMatch.level3

    testLogger.info(`Region Levels after updating CHED with Net Weight: `, {
      finalRegionTotal,
      finalRegionEuTotal,
      finalRegionEuMatchLevel1,
      finalRegionEuMatchLevel2,
      finalRegionEuMatchLevel3,
      finalRegionEuNoMatchLevel1,
      finalRegionEuNoMatchLevel2,
      finalRegionEuNoMatchLevel3
    })

    // Total Checks
    expect(finalRegionTotal).to.be.greaterThanOrEqual(thirdRegionTotal)
    expect(finalRegionEuTotal).to.be.greaterThanOrEqual(thirdRegionEuTotal)

    // Match Checks
    expect(finalRegionEuMatchLevel1).to.be.equal(thirdRegionEuMatchLevel1)
    expect(finalRegionEuMatchLevel2).to.be.equal(thirdRegionEuMatchLevel2)
    expect(finalRegionEuMatchLevel3).to.be.greaterThan(thirdRegionEuMatchLevel3)

    // No Match Checks
    expect(finalRegionEuNoMatchLevel1).to.be.equal(thirdRegionEuNoMatchLevel1)
    expect(finalRegionEuNoMatchLevel2).to.be.equal(thirdRegionEuNoMatchLevel2)
    expect(finalRegionEuNoMatchLevel3).to.be.lessThan(
      thirdRegionEuNoMatchLevel3
    )
  })
})

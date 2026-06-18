function extractRegionMetrics(levels, regionKey) {
  const region = levels[regionKey]

  return {
    total: levels.total,
    regionTotal: region.total,
    matchLevel1: region.match.level1,
    matchLevel2: region.match.level2,
    matchLevel3: region.match.level3,
    noMatchLevel1: region.noMatch.level1,
    noMatchLevel2: region.noMatch.level2,
    noMatchLevel3: region.noMatch.level3
  }
}

const testCases = [
  {
    regionKey: 'eu',
    regionLabel: 'EU',
    dispatchCountryCode: 'IT'
  },
  {
    regionKey: 'row',
    regionLabel: 'ROW',
    dispatchCountryCode: 'BD'
  }
]

describe('Reporting Matching Summary Levels by Region', function () {
  testCases.forEach(({ regionKey, regionLabel, dispatchCountryCode }) => {
    it(`should update region levels for ${regionLabel}`, async function () {
      const now = Date.now()
      const from = new Date(now - 10 * 1000).toISOString()
      const to = new Date(now + 10 * 1000).toISOString()
      const allRegion = await getMatchingLevelsByRegion(from, to)
      const allRegionMetrics = extractRegionMetrics(allRegion, regionKey)

      testLogger.info(`Initial ${regionLabel} region levels at no match:`, {
        allRegionMetrics
      })

      const mrn = generateRandomMRN()
      const docRef = await generateDocumentReference()

      testLogger.info(`${regionLabel} MRN and DocRef:`, {
        mrn,
        docRef,
        dispatchCountryCode
      })

      testLogger.info('NO MATCH LEVEL 1')
      testLogger.info('Sending clearance request for no match')
      await newClearanceRequest()
        .addItem({
          TaricCommodityCode: '1601009105',
          ItemNetMass: 500,
          Documents: [{ DocumentCode: 'C640', DocumentReference: docRef }],
          Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
        })
        .withMRN(mrn)
        .withEntryVersionNumber(1)
        .withDispatchCountryCode(dispatchCountryCode)
        .sendClearanceRequest()
        .then(async (test) => {
          await test.waitForDecision('X00')
        })

      const firstRegion = await waitForLevelsByRegionChange(allRegion, () =>
        getMatchingLevelsByRegion(from, to)
      )
      const firstRegionMetrics = extractRegionMetrics(firstRegion, regionKey)

      testLogger.info('Region levels after sending custom declarations:', {
        firstRegionMetrics
      })

      // Total checks
      expect(firstRegionMetrics.total).to.be.greaterThanOrEqual(
        allRegionMetrics.total
      )
      expect(firstRegionMetrics.regionTotal).to.be.greaterThanOrEqual(
        allRegionMetrics.regionTotal
      )

      // Match checks
      expect(firstRegionMetrics.matchLevel1).to.be.equal(
        allRegionMetrics.matchLevel1
      )
      expect(firstRegionMetrics.matchLevel2).to.be.equal(
        allRegionMetrics.matchLevel2
      )
      expect(firstRegionMetrics.matchLevel3).to.be.equal(
        allRegionMetrics.matchLevel3
      )

      // No match checks
      expect(firstRegionMetrics.noMatchLevel1).to.be.greaterThanOrEqual(
        allRegionMetrics.noMatchLevel1
      )
      expect(firstRegionMetrics.noMatchLevel2).to.be.equal(
        allRegionMetrics.noMatchLevel2
      )
      expect(firstRegionMetrics.noMatchLevel3).to.be.equal(
        allRegionMetrics.noMatchLevel3
      )

      testLogger.info('MATCH LEVEL 1, NO MATCH LEVEL 2')
      testLogger.info('Sending CHED-A to match at level 1')
      await sendIpaffsMessage(
        loadIPAFFSJson('CHEDA.json', {
          referenceNumber: docRef,
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
      await waitForSpecificDecision(mrn, 'H01')

      const secondRegion = await waitForLevelsByRegionChange(firstRegion, () =>
        getMatchingLevelsByRegion(from, to)
      )
      const secondRegionMetrics = extractRegionMetrics(secondRegion, regionKey)

      testLogger.info('Region levels after sending CHEDs:', {
        secondRegionMetrics
      })

      // Total checks
      expect(secondRegionMetrics.total).to.be.greaterThanOrEqual(
        firstRegionMetrics.total
      )
      expect(secondRegionMetrics.regionTotal).to.be.greaterThanOrEqual(
        firstRegionMetrics.regionTotal
      )

      // Match checks
      expect(secondRegionMetrics.matchLevel1).to.be.greaterThan(
        firstRegionMetrics.matchLevel1
      )
      expect(secondRegionMetrics.matchLevel2).to.be.equal(
        firstRegionMetrics.matchLevel2
      )
      expect(secondRegionMetrics.matchLevel3).to.be.equal(
        firstRegionMetrics.matchLevel3
      )

      // No match checks
      expect(secondRegionMetrics.noMatchLevel1).to.be.lessThan(
        firstRegionMetrics.noMatchLevel1
      )
      expect(secondRegionMetrics.noMatchLevel2).to.be.greaterThan(
        firstRegionMetrics.noMatchLevel2
      )
      expect(secondRegionMetrics.noMatchLevel3).to.be.equal(
        firstRegionMetrics.noMatchLevel3
      )

      testLogger.info('MATCH LEVEL 1, AND LEVEL 2, NO MATCH LEVEL 3')
      testLogger.info('Updating CHED-A to match at level 2')
      await sendIpaffsMessage(
        loadIPAFFSJson('CHEDA.json', {
          referenceNumber: docRef,
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
      await waitForSpecificDecision(mrn, 'H01')

      const thirdRegion = await waitForLevelsByRegionChange(secondRegion, () =>
        getMatchingLevelsByRegion(from, to)
      )
      const thirdRegionMetrics = extractRegionMetrics(thirdRegion, regionKey)

      testLogger.info('Region levels after updating CHED with commodity:', {
        thirdRegionMetrics
      })

      // Total checks
      expect(thirdRegionMetrics.total).to.be.greaterThanOrEqual(
        secondRegionMetrics.total
      )
      expect(thirdRegionMetrics.regionTotal).to.be.greaterThanOrEqual(
        secondRegionMetrics.regionTotal
      )

      // Match checks
      expect(thirdRegionMetrics.matchLevel1).to.be.equal(
        secondRegionMetrics.matchLevel1
      )
      expect(thirdRegionMetrics.matchLevel2).to.be.greaterThan(
        secondRegionMetrics.matchLevel2
      )
      expect(thirdRegionMetrics.matchLevel3).to.be.equal(
        secondRegionMetrics.matchLevel3
      )

      // No match checks
      expect(thirdRegionMetrics.noMatchLevel1).to.be.equal(
        secondRegionMetrics.noMatchLevel1
      )
      expect(thirdRegionMetrics.noMatchLevel2).to.be.lessThan(
        secondRegionMetrics.noMatchLevel2
      )
      expect(thirdRegionMetrics.noMatchLevel3).to.be.greaterThan(
        secondRegionMetrics.noMatchLevel3
      )

      testLogger.info('MATCH LEVEL 1, LEVEL 2, AND LEVEL 3')
      testLogger.info('Updating CHED-A to match level 3')
      await sendIpaffsMessage(
        loadIPAFFSJson('CHEDA.json', {
          referenceNumber: docRef,
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
      await waitForSpecificDecision(mrn, 'H01')

      const finalRegion = await waitForLevelsByRegionChange(thirdRegion, () =>
        getMatchingLevelsByRegion(from, to)
      )
      const finalRegionMetrics = extractRegionMetrics(finalRegion, regionKey)

      testLogger.info('Region levels after updating CHED with net weight:', {
        finalRegionMetrics
      })

      // Total checks
      expect(finalRegionMetrics.total).to.be.greaterThanOrEqual(
        thirdRegionMetrics.total
      )
      expect(finalRegionMetrics.regionTotal).to.be.greaterThanOrEqual(
        thirdRegionMetrics.regionTotal
      )

      // Match checks
      expect(finalRegionMetrics.matchLevel1).to.be.equal(
        thirdRegionMetrics.matchLevel1
      )
      expect(finalRegionMetrics.matchLevel2).to.be.equal(
        thirdRegionMetrics.matchLevel2
      )
      expect(finalRegionMetrics.matchLevel3).to.be.greaterThan(
        thirdRegionMetrics.matchLevel3
      )

      // No match checks
      expect(finalRegionMetrics.noMatchLevel1).to.be.equal(
        thirdRegionMetrics.noMatchLevel1
      )
      expect(finalRegionMetrics.noMatchLevel2).to.be.equal(
        thirdRegionMetrics.noMatchLevel2
      )
      expect(finalRegionMetrics.noMatchLevel3).to.be.lessThan(
        thirdRegionMetrics.noMatchLevel3
      )
    })
  })
})

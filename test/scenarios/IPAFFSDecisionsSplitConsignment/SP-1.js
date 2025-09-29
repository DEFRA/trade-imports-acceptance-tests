describe('CHED-PP BTMS receives a message to change the status of an existing CHED to SPLIT CONSIGNMENT - SP-1', function () {
  it('', async function () {
    this.timeout(70000)

    // Create a ched-pp with multiple commodities
    this.docRef = await generateDocumentReference({
      letter: 'PP',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        version: 1,
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      })
    )
    testLogger.info('✓ A new IPAFFS notification sent successfully')

    // Send a Clearance request
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '8432100000',
        GoodsDescription: 'Farm Machinery',
        Documents: [{ DocumentCode: 'N851', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }]
      })
      .addItem({
        TaricCommodityCode: '0604209000',
        GoodsDescription: '+ Crataegomespilus dardarii',
        Documents: [{ DocumentCode: 'N851', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H219', 'H02')
      })
    testLogger.info('✓ A clearance request sent successfully')

    // Reject one commodity and accept other
    testLogger.info('✓ IPAFFS notification sending partially reject')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        referenceNumber: this.docRef,
        version: 2,
        status: 'PARTIALLY_REJECTED',
        lastUpdated: new Date().toISOString(),
        splitConsignment: {
          validReferenceNumber: `${this.docRef}V`,
          rejectedReferenceNumber: `${this.docRef}R`
        },
        partTwo: {
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Percy',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-08-06T23:21:12.67258701'
            }
          },
          commodityChecks: [
            {
              uniqueComplementId: '81b9298c-e025-44b8-9530-36bca7f1b113',
              checks: [
                {
                  type: 'PHSI_DOCUMENT',
                  status: 'Non compliant',
                  reason: 'AD invalid'
                },
                {
                  type: 'PHSI_IDENTITY',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_PHYSICAL',
                  status: 'Compliant'
                }
              ]
            },
            {
              uniqueComplementId: '86861d79-60aa-4102-b9e4-080bc001242f',
              checks: [
                {
                  type: 'PHSI_DOCUMENT',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_IDENTITY',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_PHYSICAL',
                  status: 'Compliant'
                }
              ]
            }
          ],
          inspectionRequired: 'Required'
        }
      })
    )
    testLogger.info(
      '✓ A PARTIALLY_REJECTED IPAFFS notification sent successfully'
    )

    const decisionXml = await waitForSpecificDecision(this.mrn, 'H01')
    const codes = await extractDecisionCodes(decisionXml)
    const h01Count = codes.filter((code) => code.decisionCode === 'H01').length
    expect(h01Count).to.equal(2)

    // Split the consignment
    testLogger.info(
      'Splitting the consignment and sending VALIDATED & REJECTED IPAFFS notifications'
    )
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        referenceNumber: `${this.docRef}V`,
        version: 1,
        status: 'VALIDATED',
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            totalGrossWeight: 10,
            totalNetWeight: 10,
            numberOfPackages: 2,
            commodityComplement: [
              {
                commodityID: '06042090',
                commodityDescription: 'Other',
                complementID: 2,
                complementName: '+ Crataegomespilus dardarii',
                eppoCode: 'CXQDA',
                speciesID: '1345651',
                speciesName: '+ Crataegomespilus dardarii',
                speciesNomination: '+ Crataegomespilus dardarii'
              }
            ],
            complementParameterSet: [
              {
                uniqueComplementID: '86861d79-60aa-4102-b9e4-080bc001242f',
                complementID: 2,
                speciesID: '1345651',
                keyDataPair: [
                  {
                    key: 'regulatory_authority',
                    data: 'PHSI'
                  },
                  {
                    key: 'type_package',
                    data: 'Box'
                  },
                  {
                    key: 'netweight',
                    data: '10'
                  },
                  {
                    key: 'number_package',
                    data: '2'
                  },
                  {
                    key: 'quantity',
                    data: '2'
                  },
                  {
                    key: 'type_quantity',
                    data: 'Bulbs'
                  },
                  {
                    key: 'commodity_group',
                    data: 'Foliage, branches and other parts of plants'
                  }
                ]
              }
            ],
            includeNonAblactedAnimals: false,
            countryOfOrigin: 'FR',
            countryOfOriginIsPodCountry: true,
            isLowRiskArticle72Country: true,
            consignedCountry: 'FR',
            consignedCountryInChargeGroup: true
          }
        },
        partTwo: {
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Percy',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-08-06T23:21:12.67258701'
            }
          },
          commodityChecks: [
            {
              uniqueComplementId: '86861d79-60aa-4102-b9e4-080bc001242f',
              checks: [
                {
                  type: 'PHSI_DOCUMENT',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_IDENTITY',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_PHYSICAL',
                  status: 'Compliant'
                }
              ]
            }
          ],
          inspectionRequired: 'Required'
        }
      })
    )

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        referenceNumber: `${this.docRef}R`,
        version: 1,
        status: 'REJECTED',
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            totalGrossWeight: 10,
            totalNetWeight: 10,
            numberOfPackages: 2,
            commodityComplement: [
              {
                commodityID: '84321000',
                commodityDescription: 'Ploughs',
                complementID: 1,
                complementName: 'Farm Machinery',
                eppoCode: 'NNNXX',
                speciesID: '1591031',
                speciesName: 'Farm Machinery',
                speciesClass: '1591031',
                speciesNomination: 'Farm Machinery'
              }
            ],
            complementParameterSet: [
              {
                uniqueComplementID: '81b9298c-e025-44b8-9530-36bca7f1b113',
                complementID: 1,
                speciesID: '1591031',
                keyDataPair: [
                  {
                    key: 'regulatory_authority',
                    data: 'PHSI'
                  },
                  {
                    key: 'commodity_group',
                    data: 'Machinery and vehicles which have been operated for agricultural or forestry purposes'
                  },
                  {
                    key: 'type_package',
                    data: 'Box'
                  },
                  {
                    key: 'netweight',
                    data: '10'
                  },
                  {
                    key: 'number_package',
                    data: '2'
                  },
                  {
                    key: 'quantity',
                    data: '2'
                  },
                  {
                    key: 'type_quantity',
                    data: 'Bulbs'
                  }
                ]
              }
            ],
            includeNonAblactedAnimals: false,
            countryOfOrigin: 'FR',
            countryOfOriginIsPodCountry: true,
            isLowRiskArticle72Country: true,
            consignedCountry: 'FR',
            consignedCountryInChargeGroup: true
          }
        },
        partTwo: {
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Percy',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-08-06T23:21:12.67258701'
            }
          },
          commodityChecks: [
            {
              uniqueComplementId: '81b9298c-e025-44b8-9530-36bca7f1b113',
              checks: [
                {
                  type: 'PHSI_DOCUMENT',
                  status: 'Non compliant',
                  reason: 'AD invalid'
                },
                {
                  type: 'PHSI_IDENTITY',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_PHYSICAL',
                  status: 'Compliant'
                }
              ]
            }
          ],
          inspectionRequired: 'Required'
        }
      })
    )

    // Amend the Clearance request
    testLogger.info('Sending updated clearance request with V & R')
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '8432100000',
        GoodsDescription: 'Farm Machinery',
        Documents: [
          { DocumentCode: 'N851', DocumentReference: `${this.docRef}R` }
        ],
        Checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }]
      })
      .addItem({
        TaricCommodityCode: '0604209000',
        GoodsDescription: '+ Crataegomespilus dardarii',
        Documents: [
          { DocumentCode: 'N851', DocumentReference: `${this.docRef}V` }
        ],
        Checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(2)
      .withPreviousVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H219', 'N01')
        await test.waitForCheckDecision('H219', 'C03')
      })
  })
})

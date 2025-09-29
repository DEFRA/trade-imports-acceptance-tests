describe('BTMS receives a ClearanceRequest for a MRN that is tri-regulated (CHED-D, CHED-PP PHSI & CHED-PP HMI) - IP-11', function () {
  it('', async function () {
    this.timeout(70000)

    this.chedppDocRef = await generateDocumentReference({
      letter: 'PP',
      prefixLength: 4
    })
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        version: 1,
        status: 'SUBMITTED',
        referenceNumber: this.chedppDocRef,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '07096010',
                commodityDescription: 'Sweet peppers',
                complementID: 1,
                complementName: 'Capsicum annuum',
                eppoCode: 'CPSAN',
                speciesID: '1591031',
                speciesName: 'Farm Machinery',
                speciesClass: '1070961',
                speciesNomination: 'Sweet peppers'
              }
            ]
          }
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      })
    )

    this.cheddDocRef = await generateDocumentReference({
      letter: 'D',
      prefixLength: 4,
      increment: 2
    })
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDD.json', {
        version: 1,
        status: 'SUBMITTED',
        referenceNumber: this.cheddDocRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      })
    )

    // Send a Clearance request
    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '0709601000',
        GoodsDescription: 'Sweet peppers',
        Documents: [
          { DocumentCode: 'N851', DocumentReference: this.chedppDocRef },
          { DocumentCode: 'N002', DocumentReference: this.chedppDocRef }
        ],
        Checks: [
          { CheckCode: 'H219', DepartmentCode: 'PHSI' },
          { CheckCode: 'H218', DepartmentCode: 'HMI' }
        ]
      })
      .addItem({
        TaricCommodityCode: '0709601000',
        GoodsDescription: 'Sweet peppers',
        Documents: [
          { DocumentCode: 'C678', DocumentReference: this.cheddDocRef }
        ],
        Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H218', 'H02')
        await test.waitForCheckDecision('H219', 'H02')
        await test.waitForCheckDecision('H223', 'H02')
      })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDPP.json', {
        version: 3,
        status: 'VALIDATED',
        referenceNumber: this.chedppDocRef,
        lastUpdated: new Date().toISOString(),
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '07096010',
                commodityDescription: 'Sweet peppers',
                complementID: 1,
                complementName: 'Capsicum annuum',
                eppoCode: 'CPSAN',
                speciesID: '1591031',
                speciesName: 'Farm Machinery',
                speciesClass: '1070961',
                speciesNomination: 'Sweet peppers'
              }
            ]
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
                },
                {
                  type: 'HMI',
                  status: 'Compliant'
                }
              ]
            }
          ],
          inspectionRequired: 'Required'
        }
      })
    )
    await waitForSpecificCheckDecision(this.mrn, 'H218', 'C03')
    await waitForSpecificCheckDecision(this.mrn, 'H219', 'C03')

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDD.json', {
        version: 1,
        status: 'VALIDATED',
        referenceNumber: this.cheddDocRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {
            decision: 'Acceptable for Internal Market',
            freeCirculationPurpose: 'Animal Feeding Stuff'
          },
          inspectionRequired: 'Required'
        }
      })
    )
    await waitForSpecificCheckDecision(this.mrn, 'H223', 'C03')
  })
})

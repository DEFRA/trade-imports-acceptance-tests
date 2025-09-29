describe('BTMS receives an update to an existing IPAFFS Notification - IP-5', function () {
  it('', async function () {
    this.timeout(70000)

    testLogger.info('Send initial IPAFFS notification')
    this.docRef = await generateDocumentReference()
    this.mrn = generateRandomMRN()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        version: 1,
        status: 'SUBMITTED',
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H221', 'H01')
      })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'SUBMITTED',
        partOne: {
          commodities: {
            commodityComplement: [
              {
                commodityID: '0101',
                commodityDescription: 'Live horses, asses, mules and hinnies',
                complementID: 1,
                complementName: 'Equus asinus',
                speciesID: '242089',
                speciesName: 'Equus asinus',
                speciesType: '2',
                speciesClass: '147603',
                speciesNomination: 'Equus asinus'
              },
              {
                commodityID: '03063690',
                commodityDescription: 'Live swine',
                complementID: 1,
                complementName: 'Sus scrofa domesticus',
                speciesID: '3015',
                speciesName: 'Sus scrofa domesticus',
                speciesTypeName: 'Domestic',
                speciesType: '16',
                speciesClass: '3015',
                speciesNomination: 'Sus scrofa domesticus'
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

    const importsPreNotificationText = await waitForDataInAPI(
      this.docRef,
      'IPAFFS',
      {
        importPreNotification: { version: 2 }
      }
    )

    const importsPreNotification = JSON.parse(importsPreNotificationText)

    // Check commodityComplements has 2 items
    const commodityComplements =
      importsPreNotification.importPreNotification.partOne.commodities
        .commodityComplements
    assert(
      Array.isArray(commodityComplements),
      'commodityComplements should be an array'
    )
    assert(
      commodityComplements.length === 2,
      'commodityComplements should have exactly 2 items'
    )

    // Check that one item has speciesId: '242089'
    const species242089 = commodityComplements.find(
      (item) => item.speciesId === '242089'
    )
    assert(species242089, 'Should have an item with speciesId: 242089')
    assert(
      species242089.commodityDescription ===
        'Live horses, asses, mules and hinnies',
      'Species 242089 should have correct commodity description'
    )
    assert(
      species242089.speciesName === 'Equus asinus',
      'Species 242089 should have correct species name'
    )

    // Check that other item has speciesId: '3015'
    const species3015 = commodityComplements.find(
      (item) => item.speciesId === '3015'
    )
    assert(species3015, 'Should have an item with speciesId: 3015')
    assert(
      species3015.commodityDescription === 'Live swine',
      'Species 3015 should have correct commodity description'
    )
    assert(
      species3015.speciesName === 'Sus scrofa domesticus',
      'Species 3015 should have correct species name'
    )
  })
})

describe('BTMS receives a ClearanceRequest for a MRN with a single item with a multiple known IPAFFS DocumentReferences - CR-7', function () {
  this.timeout(70000)
  step('Send 2 IPAFFS notifications', async () => {
    this.docRef1 = generateDocumentReference()
    this.docRef2 = generateDocumentReference()

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef2,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef1,
        lastUpdated: new Date().toISOString(),
        version: 2,
        status: 'VALIDATED',
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market'
          },
          inspectionRequired: 'Not required'
        }
      })
    )
  })

  step('Send Clearance Request', async () => {
    const builder = new SoapMessageBuilder()

    builder
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef2 }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        TaricCommodityCode: '0103911000',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef1 }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })

    this.mrn = generateRandomMRN()
    console.log(this.mrn)
    console.log('Items count:', builder.items.length)
    console.log(JSON.stringify(builder.items, null, 2))
    const soapEnvelope = builder.build({
      mrn: this.mrn
    })
    console.log(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
    console.log('Sent clearance request')
  })

  step('Wait for decision - should be a hold H01', async () => {
    const responseText = await waitForDecision(this.mrn, lastStartTime)
    const decisionCode = parseDecision(responseText)
    console.log('DecisionCode:', decisionCode)

    assert.strictEqual(decisionCode, 'H01', 'Decision code does not match')
  })
})

describe('BTMS receives a Manual Override decision for an existing MRN - FN-1', function () {
  this.timeout(70000)

  step('Send initial IPAFFS notification', async () => {
    this.docRef = generateDocumentReference()

    sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
  })

  step('Send Clearance Request', async () => {
    const builder = new SoapMessageBuilder()

    builder.addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.build({
      EntryVersionNumber: 3,
      mrn: this.mrn
    })
    console.log(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)

    const responseText = await waitForDecision(this.mrn, lastStartTime)
    const decisionCode = parseDecision(responseText)
    assert.strictEqual(decisionCode, 'H01', 'Decision code does not match')
  })

  step(
    'Send updated IPAFFS notification with decision (to release)',
    async () => {
      sendIpaffsMessage(
        loadIPAFFSJson('CHEDA.json', {
          referenceNumber: this.docRef,
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
      const responseText2 = await waitForDecision(this.mrn, lastStartTime)
      const decisionCode2 = parseDecision(responseText2)
      assert.strictEqual(decisionCode2, 'C03', 'Decision code does not match')
    }
  )

  step('Send finalisation', async () => {
    const finalisationSoapMsg = new SoapMessageBuilder('finalisation').build({
      EntryReference: this.mrn,
      EntryVersionNumber: 3,
      FinalState: 0,
      DecisionNumber: 2,
      ManualAction: 'Y'
    })

    console.log(finalisationSoapMsg)
    await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, finalisationSoapMsg)
    console.log('Sent finalisaton request')

    const responseText = await waitForDataInAPI(this.mrn)

    console.log('Finalisation response:', responseText)
    assert.ok(
      responseText.includes('"isManualRelease":true'),
      'Expected a manual release'
    )
  })
})

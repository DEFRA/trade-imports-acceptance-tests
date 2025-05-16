describe('BTMS sends a DecisionNotification for a Refusal decision on a MRN - DN-3', function () {
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
      mrn: this.mrn
    })
    console.log(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)
  })

  step('Wait for decision - should be a hold H01', async () => {
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
          status: 'REJECTED',
          partTwo: {
            decision: {
              consignmentAcceptable: false,
              notAcceptableAction: 'reexport',
              notAcceptableActionByDate: new Date(Date.now() + 604800000)
                .toISOString()
                .split('T')[0],
              notAcceptableReasons: ['AbsenceAdditionalGuarantees'],
              decision: 'Non Acceptable'
            },
            inspectionRequired: 'Not required'
          }
        })
      )

      const responseText2 = await waitForDecision(this.mrn, lastStartTime)
      const decisionCode2 = parseDecision(responseText2)
      assert.strictEqual(decisionCode2, 'N04', 'Decision code does not match')
    }
  )
})

describe('BTMS receives a Manual Override decision for an existing MRN - FN-1', function () {
  it('', async function () {
    testLogger.info('Send initial IPAFFS notification')
    this.docRef = generateDocumentReference()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: { consignmentAcceptable: false },
          inspectionRequired: 'Not required'
        }
      })
    )
    testLogger.info('Send Clearance Request')
    const builder = new SoapMessageBuilder()

    builder
      .addItem({
        TaricCommodityCode: '0103911000',
        ItemNumber: 1,
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .addItem({
        ItemNumber: 75,
        TaricCommodityCode: '0103911001',
        Documents: [
          {
            DocumentCode: 'C640',
            DocumentReference: generateDocumentReference()
          }
        ],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })

    this.mrn = generateRandomMRN()
    const soapEnvelope = builder.buildMessage({
      EntryVersionNumber: 1,
      mrn: this.mrn
    })

    testLogger.info(soapEnvelope)

    await sendSoapRequest(SUBMIT_CLEARANCE_REQUEST_ENDPOINT, soapEnvelope)

    testLogger.info('Wait for decision - should be a hold H01')

    const codes1 = await extractDecisionCodes(
      await waitForDecision(this.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', { decisionCodes: codes1 })
    assert(codes1.includes('H01'), 'Expected decision code H01 not found')
    testLogger.info(
      'Send updated IPAFFS notification with decision (to release)',
      async () => {
        await sendIpaffsMessage(
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
      }
    )

    testLogger.info('Wait for decision - should be a hold C03')
    const codes2 = await extractDecisionCodes(
      await waitForDecision(this.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', { decisionCodes: codes2 })
    assert(codes2.includes('C03'), 'Expected decision code C03 not found')
    testLogger.info('Send finalisation')
    const finalisationSoapMsg = new SoapMessageBuilder(
      'finalisation'
    ).buildMessage({
      EntryReference: this.mrn,
      EntryVersionNumber: 1,
      FinalState: '0',
      DecisionNumber: 2,
      ManualAction: 'Y'
    })

    testLogger.info(finalisationSoapMsg)
    await sendSoapRequest(SUBMIT_FINALSIATION_ENDPOINT, finalisationSoapMsg)
    testLogger.info('Sent finalisaton request')

    const responseText = await waitForDataInAPI(this.mrn)

    testLogger.info('Finalisation response:', { responseText })
    assert.ok(
      responseText.includes('"isManualRelease":true'),
      'Expected a manual release'
    )
  })
})

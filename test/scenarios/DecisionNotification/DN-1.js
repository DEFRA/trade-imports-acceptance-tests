import '#steps/steps.js'

describe('BTMS sends a DecisionNotification for a Hold decision on a MRN - DN-1', function () {
  it('', async function () {
    this.docRef = generateDocumentReference()

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )

    this.clearanceRequest = newClearanceRequest().addItem({
      TaricCommodityCode: '0103911000',
      Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
    })
    this.clearanceRequest.buildModel()

    await sendClearanceRequest(this.clearanceRequest.buildMessage())

    const codes = await extractDecisionCodes(
      await waitForDecision(this.clearanceRequest.mrn, thisStepStartTime)
    )
    testLogger.info('Received decision codes:', { decisionCodes: codes })
    assert(codes.includes('H01'), 'Expected decision code H01 not found')
  })
})

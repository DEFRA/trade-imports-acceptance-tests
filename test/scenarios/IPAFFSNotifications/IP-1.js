describe('BTMS receives an IPAFFS Notification that does not have an associated MRN / DocumentReference - without decision - IP-1', function () {
  it('', async function () {
    this.timeout(70000)
    testLogger.info('Send IPAFFS notification')
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
    testLogger.info('Check it was received')
    await waitForDataInAPI(this.docRef, 'IPAFFS')
  })
})

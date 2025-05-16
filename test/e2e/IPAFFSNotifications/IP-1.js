describe('BTMS receives an IPAFFS Notification that does not have an associated MRN / DocumentReference - without decision - IP-1', function () {
  this.timeout(70000)
  step('Send IPAFFS notification', async () => {
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

  step('Check it was received', async () => {
    await waitForDataInAPI(this.docRef, 'IPAFFS')
  })
})

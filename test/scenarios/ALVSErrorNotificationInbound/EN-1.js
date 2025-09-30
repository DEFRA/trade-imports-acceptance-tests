describe('Inbound Errors', function () {
  describe('CDS sends an error notification', function () {
    it('for a Decision Notification that had an invalid MRN', async function () {
      this.timeout(70000)

      testLogger.info('Simulate CDS sending an error message to the gateway')

      await newAlvsErrorRequest()
        .withEntryReference(generateRandomMRN())
        .sendErrorNotification()
        .then(async (test) => {
          await test.expectErrorRecorded('HMRCVAL101')
        })
    })
  })
})

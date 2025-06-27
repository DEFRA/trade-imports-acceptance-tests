describe('Inbound Errors', function () {
  describe('CDS sends an error notification', function () {
    testCase(
      'for a Decision Notification that had an invalid MRN',
      async function () {
        testLogger.info('Simulate CDS sending an error message to the gateway')

        const errorSoapMsg = new SoapMessageBuilder('error').buildMessage({
          EntryReference: (testData.mrn = generateRandomMRN())
        })

        await sendSoapRequest(SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT, errorSoapMsg)

        testLogger.info('Wait for error to be recorded')
        const responseText = await waitForDataInAPI(testData.mrn)

        expect(responseText).to.include('HMRCVAL101')
      }
    )
  })
})

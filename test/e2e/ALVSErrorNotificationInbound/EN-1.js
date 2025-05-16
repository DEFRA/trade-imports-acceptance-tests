describe('BTMS send a DecisionNotification to CDS with an invalid MRN - EN-1', function () {
  this.timeout(70000)
  step('Send HMRC Error message', async () => {
    this.mrn = generateRandomMRN()

    const errorSoapMsg = new SoapMessageBuilder('error').build({
      EntryReference: this.mrn
    })

    await sendSoapRequest(SUBMIT_INBOUND_ALVS_ERROR_ENDPOINT, errorSoapMsg)
  })

  step('Wait for error to be recorded', async () => {
    const responseText = await waitForDataInAPI(this.mrn)

    expect(responseText).to.include('HMRCVAL101')
  })
})

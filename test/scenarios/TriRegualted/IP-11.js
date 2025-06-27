describe('BTMS receives a ClearanceRequest for a MRN that is tri-regulated (CHED-D, CHED-PP PHSI & CHED-PP HMI) - IP-11', function () {
  it.skip('', async function () {
    this.timeout(70000)
    sendIpaffsMessage(
      loadIPAFFSJson('temp2.json', {
        lastUpdated: new Date().toISOString()
      })
    )
  })
})

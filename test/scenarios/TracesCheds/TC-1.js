describe('BTMS receives a TRACES CHED - TC-1', function () {
  this.timeout(70000)

  it('stores the TRACES CHED in the Data API', async function () {
    this.docRef = await generateDocumentReference()

    const json = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      return setTracesLastUpdateTime(content, new Date().toISOString())
    })

    testLogger.info('Send TRACES CHED to the processor')
    const { response } = await processorPostTracesChed(json)
    expect(response.status).to.equal(204)

    testLogger.info('Check it was received')
    const storedText = await waitForDataInAPI(this.docRef, 'TRACES')
    const stored = JSON.parse(storedText)

    expect(stored.ched).to.deep.include(json)
  })
})

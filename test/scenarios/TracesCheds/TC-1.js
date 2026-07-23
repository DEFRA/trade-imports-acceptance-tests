describe('BTMS receives a TRACES CHED - TC-1', function () {
  this.timeout(70000)

  it('stores the TRACES CHED in the Data API', async function () {
    this.docRef = await generateDocumentReference()

    const json = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      return content
    })

    testLogger.info('Send TRACES CHED')
    // A queue is not yet set up to ingest these via the processor, so this
    // just sends it to the Data API directly
    const resp = await dataApiClientPutTracesChed(this.docRef, json)
    expect(resp.status).to.equal(201)

    testLogger.info('Check it was received')
    const storedText = await waitForDataInAPI(this.docRef, 'TRACES')
    const stored = JSON.parse(storedText)

    expect(stored.ched).to.deep.include(json)
  })
})

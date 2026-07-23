const getGrossWeight = (parsed) =>
  parsed.ched.specifiedConsignment.includedConsignmentItem[0]
    .includedTradeLineItem[0].grossWeight.content

describe('BTMS receives an update to an existing TRACES CHED - TC-2', function () {
  this.timeout(70000)

  before(async function () {
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
    await waitForDataInAPI(this.docRef, 'TRACES')
  })

  it('stores the updated CHED when a new version is received', async function () {
    const updated = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      content.specifiedConsignment.includedConsignmentItem[0].includedTradeLineItem[0].grossWeight.content =
        '200'
      return content
    })

    testLogger.info('Fetching etag for existing TRACES Ched')
    const existing = await dataApiClientGetTracesChed(this.docRef)
    const etag = existing.headers.get('etag')

    expect(etag).not.toBeNull()

    const before = JSON.parse(await existing.text())
    expect(getGrossWeight(before)).to.equal('100')

    testLogger.info('Sending an updated TRACES Ched')
    const updateResp = await dataApiClientPutTracesChed(
      this.docRef,
      updated,
      etag
    )
    expect(updateResp.status).to.equal(204)

    testLogger.info('Checking if TRACES Ched was updated')
    const after = await dataApiClientGetTracesChed(this.docRef)
    const parsed = JSON.parse(await after.text())
    expect(getGrossWeight(parsed)).to.equal('200')
  })
})

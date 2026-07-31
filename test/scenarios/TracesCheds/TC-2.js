const getGrossWeight = (parsed) =>
  parsed.ched.specifiedConsignment.includedConsignmentItem[0]
    .includedTradeLineItem[0].grossWeight.content

describe('BTMS receives an update to an existing TRACES CHED - TC-2', function () {
  this.timeout(70000)

  before(async function () {
    this.docRef = await generateDocumentReference()

    const json = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      return setTracesLastUpdateTime(content, new Date().toISOString())
    })

    testLogger.info('Send TRACES CHED to the processor')
    const { response } = await processorPostTracesChed(json)
    expect(response.status).to.equal(204)

    testLogger.info('Check it was received')
    await waitForDataInAPI(this.docRef, 'TRACES')
  })

  it('stores the updated CHED when a new version is received', async function () {
    const updated = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      content.specifiedConsignment.includedConsignmentItem[0].includedTradeLineItem[0].grossWeight.content =
        '200'
      return setTracesLastUpdateTime(
        content,
        new Date(Date.now() + 1000).toISOString()
      )
    })

    testLogger.info('Fetching existing TRACES Ched')
    const existing = await dataApiClientGetTracesChed(this.docRef)
    const before = JSON.parse(await existing.text())
    expect(getGrossWeight(before)).to.equal('100')

    testLogger.info('Sending an updated TRACES Ched to the processor')
    const { response } = await processorPostTracesChed(updated)
    expect(response.status).to.equal(204)

    testLogger.info('Checking if TRACES Ched was updated')
    await waitForDataInAPI(this.docRef, 'TRACES', {
      ched: {
        specifiedConsignment: {
          includedConsignmentItem: [
            {
              includedTradeLineItem: [{ grossWeight: { content: '200' } }]
            }
          ]
        }
      }
    })
    const after = await dataApiClientGetTracesChed(this.docRef)
    const parsed = JSON.parse(await after.text())
    expect(getGrossWeight(parsed)).to.equal('200')
  })
})

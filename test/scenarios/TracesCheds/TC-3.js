const getGrossWeight = (parsed) =>
  parsed.ched.specifiedConsignment.includedConsignmentItem[0]
    .includedTradeLineItem[0].grossWeight.content

describe('BTMS rejects a TRACES CHED update with an earlier last-update timestamp - TC-3', function () {
  this.timeout(70000)

  before(async function () {
    this.docRef = await generateDocumentReference()
    this.originalTimestamp = new Date().toISOString()

    const json = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      return setTracesLastUpdateTime(content, this.originalTimestamp)
    })

    testLogger.info('Send initial TRACES CHED to the processor')
    const { response } = await processorPostTracesChed(json)
    expect(response.status).to.equal(204)

    testLogger.info('Check it was received')
    await waitForDataInAPI(this.docRef, 'TRACES', {
      ched: {
        specifiedConsignment: {
          includedConsignmentItem: [
            { includedTradeLineItem: [{ grossWeight: { content: '100' } }] }
          ]
        }
      }
    })
  })

  it('does not store the CHED when the update has an earlier last-update timestamp', async function () {
    const staleUpdate = loadTRACESChed('TRACES-CHEDA.json', (content) => {
      content.exchangedDocument.identifier = this.docRef
      content.specifiedConsignment.includedConsignmentItem[0].includedTradeLineItem[0].grossWeight.content =
        '200'
      return setTracesLastUpdateTime(
        content,
        new Date(
          new Date(this.originalTimestamp).getTime() - 1000
        ).toISOString()
      )
    })

    testLogger.info('Send stale TRACES CHED update to the processor')
    const { response } = await processorPostTracesChed(staleUpdate)
    expect(response.status).to.equal(204)

    testLogger.info(
      'Assert the CHED was not updated (grossWeight stays 100) and remains stable'
    )
    await waitForDataInAPIWithStability(
      this.docRef,
      'TRACES',
      {
        ched: {
          specifiedConsignment: {
            includedConsignmentItem: [
              { includedTradeLineItem: [{ grossWeight: { content: '100' } }] }
            ]
          }
        }
      },
      6000
    )

    const after = await dataApiClientGetTracesChed(this.docRef)
    const parsed = JSON.parse(await after.text())
    expect(getGrossWeight(parsed)).to.equal('100')
  })
})

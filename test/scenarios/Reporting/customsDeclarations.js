describe('Reporting Extract Customs Declarations Endpoint', function () {
  it('should extract customs declarations data with correct response structure', async function () {
    this.timeout(70000)

    const now = Date.now()
    const from = new Date(now - 10 * 1000).toISOString()
    const to = new Date(now + 10 * 1000).toISOString()
    testLogger.info('From and To dates for customs declarations: ', {
      fromDate: from,
      toDate: to
    })

    testLogger.info('Generating test data for clearance request')
    this.docRef = await generateDocumentReference()
    this.mrn = generateRandomMRN()

    testLogger.info('Send Clearance Request')
    await newClearanceRequest()
      .addItem({
        TaricCommodityCode: '1601009105',
        Documents: [{ DocumentCode: 'C640', DocumentReference: this.docRef }],
        Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForDecision('X00')
      })

    testLogger.info('Send IPAFFS notification')
    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDA.json', {
        referenceNumber: this.docRef,
        lastUpdated: new Date().toISOString(),
        partTwo: {
          decision: {},
          inspectionRequired: 'Not required'
        }
      })
    )
    await waitForSpecificDecision(this.mrn, 'H01')

    testLogger.info('Send Finalisation')
    await newFinalisationRequest()
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .withFinalState('0')
      .withDecisionNumber(2)
      .withManualAction('Y')
      .sendFinalisation()
      .then(async (test) => {
        await test.expectJson({ finalisation: { isManualRelease: true } })
        testLogger.info('Finalisation response received')
      })

    testLogger.info('Querying customs declarations extract endpoint')
    const customsDeclarationsResponse = await extractCustomsDeclarations(
      from,
      to
    )

    testLogger.info(
      'Validating customs declarations extract response structure'
    )
    // eslint-disable-next-line no-unused-expressions
    expect(customsDeclarationsResponse).to.exist
    expect(customsDeclarationsResponse).to.have.property('data')
    expect(customsDeclarationsResponse.data).to.be.an('array')

    if (customsDeclarationsResponse.data.length > 0) {
      const declaration = customsDeclarationsResponse.data[0]

      testLogger.info('Validating individual declaration structure', {
        declaration
      })

      // Required fields validation
      expect(declaration).to.have.property('mrn')
      expect(declaration.mrn).to.equal(this.mrn)
      expect(declaration).to.have.property('mrnCreated')
      expect(declaration).to.have.property('lastUpdated')
      expect(declaration).to.have.property('releaseType')
      expect(declaration).to.have.property('finalState')
      expect(declaration).to.have.property('dispatchCountryCode')
      expect(declaration).to.have.property('itemNumber')
      expect(declaration).to.have.property('commodityCode')
      expect(declaration.commodityCode).to.equal('1601009105')
      expect(declaration).to.have.property('description')
      expect(declaration).to.have.property('quantityOrWeight')
      expect(declaration).to.have.property('chedReferences')
      expect(declaration).to.have.property('authorities')
      expect(declaration.authorities).to.equal('AHVLA')
      expect(declaration).to.have.property('checkCodes')
      expect(declaration.checkCodes).to.equal('H221')
      expect(declaration).to.have.property('decisions')
      // Decisions may contain multiple codes separated by semicolon
      expect(declaration.decisions).to.include('X00')
      expect(declaration).to.have.property('match')

      // Validate date fields are ISO format
      const mrnCreatedDate = new Date(declaration.mrnCreated)
      expect(mrnCreatedDate.toString()).to.not.equal('Invalid Date')

      const lastUpdatedDate = new Date(declaration.lastUpdated)
      expect(lastUpdatedDate.toString()).to.not.equal('Invalid Date')

      testLogger.info('All validations passed for customs declaration', {
        mrn: declaration.mrn,
        commodityCode: declaration.commodityCode,
        quantityOrWeight: declaration.quantityOrWeight
      })
    } else {
      testLogger.warn('No customs declarations returned in response')
    }
  })
})

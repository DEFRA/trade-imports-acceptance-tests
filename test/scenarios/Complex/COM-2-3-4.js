describe(`Multiple items on a CDS MRN - COM-2,
Multiple CHEDs being referenced either from a single item on a CDS MRN or across multiple items on a CDS MRN - COM-3,
Multiple commodity lines on a CHED - COM-4`, function () {
  it('', async function () {
    this.timeout(70000)

    this.mrn = generateRandomMRN()

    // Generate document references and send IPAFFS messages
    const chedDocRefs = []

    // First two CHEDs without iuuOption
    for (let i = 0; i < 2; i++) {
      const docRef = generateDocumentReference({
        letter: 'P',
        prefixLength: 4,
        suffixLength: 7
      })
      chedDocRefs.push(docRef)

      await sendIpaffsMessage(
        loadIPAFFSJson('CHEDP_IUU.json', {
          referenceNumber: docRef,
          lastUpdated: new Date().toISOString()
        })
      )
    }

    // Remaining 6 CHEDs with iuuOption
    for (let i = 0; i < 5; i++) {
      const docRef = generateDocumentReference({
        letter: 'P',
        prefixLength: 4,
        suffixLength: 7
      })
      chedDocRefs.push(docRef)

      await sendIpaffsMessage(
        loadIPAFFSJson('CHEDP_IUU.json', {
          referenceNumber: docRef,
          lastUpdated: new Date().toISOString(),
          partTwo: {
            controlAuthority: {
              iuuOption: 'IUUNA'
            }
          }
        })
      )
    }

    const docRef8 = generateDocumentReference({
      letter: 'P',
      prefixLength: 4,
      suffixLength: 7
    })

    await sendIpaffsMessage(
      loadIPAFFSJson('CHEDP_IUU.json', {
        referenceNumber: docRef8,
        lastUpdated: new Date().toISOString(),
        status: 'REJECTED',
        partTwo: {
          decision: {
            consignmentAcceptable: false,
            notAcceptableAction: 'other',
            notAcceptableActionOtherReason: 'no good',
            notAcceptableActionByDate: '2024-08-09',
            notAcceptableReasons: ['Other'],
            notAcceptableOtherReason: 'go home',
            decision: 'Non Acceptable'
          },
          controlAuthority: {
            iuuOption: 'IUUNA'
          }
        }
      })
    )

    // Assign to individual variables for backward compatibility
    this.chedPPDocRef1 = chedDocRefs[0]
    this.chedPPDocRef2 = chedDocRefs[1]
    this.chedPPDocRef3 = chedDocRefs[2]
    this.chedPPDocRef4 = chedDocRefs[3]
    this.chedPPDocRef5 = chedDocRefs[4]
    this.chedPPDocRef6 = chedDocRefs[5]
    this.chedPPDocRef7 = chedDocRefs[6]
    this.chedPPDocRef8 = docRef8

    await newFluentClearanceRequestTest()
      .addItem({
        TaricCommodityCode: '1601009104',
        ItemNumber: 1,
        Documents: [
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef1 },
          { DocumentCode: 'C673', DocumentReference: 'GBIUU-VARIOUS' },
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef2 },
          { DocumentCode: 'C673', DocumentReference: 'GBIUU-VARIOUS' },
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef3 }
        ],
        Checks: [
          { CheckCode: 'H222', DepartmentCode: 'PHA' },
          { CheckCode: 'H224', DepartmentCode: 'PHA' }
        ]
      })
      .addItem({
        TaricCommodityCode: '2103909089',
        ItemNumber: 2,
        Documents: [
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef4 },
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef5 },
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef6 }
        ],
        Checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }]
      })
      .addItem({
        TaricCommodityCode: '2103909089',
        ItemNumber: 3,
        Documents: [
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef7 },
          { DocumentCode: 'N853', DocumentReference: this.chedPPDocRef8 }
        ],
        Checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }]
      })
      .withMRN(this.mrn)
      .withEntryVersionNumber(1)
      .sendClearanceRequest()
      .then(async (test) => {
        await test.waitForCheckDecision('H222', 'C03')
        // Wait for check decisions for all CHED references
        const checkDecisions = [
          // CHED 1 decisions
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef1
          },
          {
            checkCode: 'H224',
            decisionCode: 'C07',
            chedRef: this.chedPPDocRef1
          },
          // CHED 2 decisions
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef2
          },
          {
            checkCode: 'H224',
            decisionCode: 'C07',
            chedRef: this.chedPPDocRef2
          },
          // CHED 3 decisions
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef3
          },
          {
            checkCode: 'H224',
            decisionCode: 'C08',
            chedRef: this.chedPPDocRef3
          },
          // CHEDs 4-8 decisions (all H222/C03)
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef4
          },
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef5
          },
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef6
          },
          {
            checkCode: 'H222',
            decisionCode: 'C03',
            chedRef: this.chedPPDocRef7
          },
          {
            checkCode: 'H222',
            decisionCode: 'N07',
            chedRef: this.chedPPDocRef8
          }
        ]

        for (const decision of checkDecisions) {
          await test.waitForCheckDecisionWithChedRef(
            decision.checkCode,
            decision.decisionCode,
            decision.chedRef
          )
        }
      })
  })
})

const cases = [
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP_GMS',
    documents: [{ DocumentCode: 'N851' }],
    checks: [
      { CheckCode: 'H219', DepartmentCode: 'PHSI' },
      { CheckCode: 'H220', DepartmentCode: 'HMI' }
    ],
    expected: [
      { checkCode: 'H219', decisionCode: 'C03' },
      { checkCode: 'H220', decisionCode: 'X00' }
    ]
  }
]

describe('Orphan Check Codes', function () {
  cases.forEach(
    ({
      name,
      jsonTemplate,
      documents = [],
      checks = [],
      decisionCode,
      expected
    }) => {
      const letter = chedLetter(jsonTemplate)
      const docCodes = documents.map((d) => d.DocumentCode).join('+') || 'NA'
      const checkLabels =
        checks.map((c) => `${c.DepartmentCode}_${c.CheckCode}`).join('+') ||
        'NA'

      it(`${checkLabels}_with_${docCodes}_and_${letter}_is_${name}`, async function () {
        testLogger.info('Send initial IPAFFS notification')

        this.docRef = await generateDocumentReference({
          letter,
          prefixLength: 4,
          suffixLength: 7
        })

        await sendIpaffsMessage(
          await loadIPAFFSJson(jsonTemplate + '.json', {
            referenceNumber: this.docRef,
            lastUpdated: new Date().toISOString(),
            status: 'VALIDATED',
            partTwo: {
              decision: {
                consignmentAcceptable: true,
                decision: 'Acceptable for Internal Market'
              },
              inspectionRequired: 'Not required'
            }
          })
        )

        this.mrn = generateRandomMRN()

        await newClearanceRequest()
          .addItem({
            TaricCommodityCode: '0103911000',
            Documents: documents.map((d) => ({
              ...d,
              DocumentReference: d.DocumentReference ?? this.docRef
            })),
            Checks: checks
          })
          .withMRN(this.mrn)
          .sendClearanceRequest()
          .then(async (test) => {
            const firstExpectedDecision =
              expected?.[0]?.decisionCode ?? decisionCode

            if (expected?.length > 1) {
              // Wait for multiple decisions
              for (const expectedPair of expected) {
                await test.waitForCheckDecision(
                  expectedPair.checkCode,
                  expectedPair.decisionCode
                )
              }
            } else {
              // Wait for single decision
              if (expected?.[0]?.checkCode) {
                await test.waitForCheckDecision(
                  expected[0].checkCode,
                  firstExpectedDecision
                )
              } else {
                await test.waitForDecision(firstExpectedDecision)
              }
            }

            testLogger.info('Received all expected decisions')
          })
      })
    }
  )
})

function chedLetter(jsonTemplate) {
  return jsonTemplate.replace(/^CHED([A-Z]+).*$/, '$1')
}

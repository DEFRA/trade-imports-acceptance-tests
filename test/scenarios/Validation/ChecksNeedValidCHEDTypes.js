const cases = [
  // Valid
  {
    name: 'valid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'C640' }],
    checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
    expected: [{ checkCode: 'H221', decisionCode: 'C03' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H218', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H218', decisionCode: 'H01' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'N002' }],
    checks: [{ CheckCode: 'H218', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H218', decisionCode: 'H01' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H220', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H220', decisionCode: 'H01' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'N002' }],
    checks: [{ CheckCode: 'H220', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H220', decisionCode: 'H01' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'C678' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'C03' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'N852' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'C03' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'N853' }],
    checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H222', decisionCode: 'C03' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'N853' }, { DocumentCode: 'C673' }],
    checks: [
      { CheckCode: 'H224', DepartmentCode: 'PHA' },
      { CheckCode: 'H222', DepartmentCode: 'PHA' }
    ],
    expected: [
      { checkCode: 'H224', decisionCode: 'C07' },
      { checkCode: 'H222', decisionCode: 'C03' }
    ]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: '9115' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'H01' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'H01' }]
  },
  {
    name: 'valid',
    jsonTemplate: 'CHEDPP_GMS',
    documents: [{ DocumentCode: 'N851' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'C03' }]
  },

  // Not Valid
  {
    name: 'notValid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'C640' }],
    checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
    expected: [{ checkCode: 'H221', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'C640' }],
    checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
    expected: [{ checkCode: 'H221', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'C640' }],
    checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
    expected: [{ checkCode: 'H221', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'C678' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'C678' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'C678' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'N852' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'N852' }],
    checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H223', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'N853' }],
    checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H222', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'N853' }],
    checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
    expected: [{ checkCode: 'H222', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'N853' }],
    checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
    expected: [
      { checkCode: 'H222', decisionCode: 'X00' },
      { checkCode: 'H222', decisionCode: 'X00' }
    ]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'N853' }, { DocumentCode: 'C673' }],
    checks: [
      { CheckCode: 'H224', DepartmentCode: 'PHA' },
      { CheckCode: 'H222', DepartmentCode: 'PHA' }
    ],
    expected: [
      { checkCode: 'H224', decisionCode: 'X00' },
      { checkCode: 'H222', decisionCode: 'X00' }
    ]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'N853' }, { DocumentCode: 'C673' }],
    checks: [
      { CheckCode: 'H224', DepartmentCode: 'PHA' },
      { CheckCode: 'H222', DepartmentCode: 'PHA' }
    ],
    expected: [
      { checkCode: 'H224', decisionCode: 'X00' },
      { checkCode: 'H222', decisionCode: 'X00' }
    ]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDPP',
    documents: [{ DocumentCode: 'N853' }, { DocumentCode: 'C673' }],
    checks: [
      { CheckCode: 'H224', DepartmentCode: 'PHA' },
      { CheckCode: 'H222', DepartmentCode: 'PHA' }
    ],
    expected: [{ checkCode: 'H224', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'N851' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: '9115' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'N851' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: '9115' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDD',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'N851' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: '9115' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDP',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H219', DepartmentCode: 'PHSI' }],
    expected: [{ checkCode: 'H219', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H218', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H218', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'C085' }],
    checks: [{ CheckCode: 'H220', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H220', decisionCode: 'X00' }]
  },
  {
    name: 'notValid',
    jsonTemplate: 'CHEDA',
    documents: [{ DocumentCode: 'N002' }],
    checks: [{ CheckCode: 'H220', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H220', decisionCode: 'X00' }]
  }
]

describe('Validation', function () {
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

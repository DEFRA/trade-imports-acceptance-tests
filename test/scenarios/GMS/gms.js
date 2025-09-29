const cases = [
  {
    name: 'valid',
    checks: [{ CheckCode: 'H220', DepartmentCode: 'HMI' }],
    expected: [{ checkCode: 'H220', decisionCode: 'X00' }]
  },
  {
    name: 'valid',
    cheds: [
      {
        template: 'CHEDPP',
        documents: [{ DocumentCode: 'N851' }]
      }
    ],
    checks: [
      { CheckCode: 'H220', DepartmentCode: 'HMI' },
      { CheckCode: 'H219', DepartmentCode: 'PHSI' }
    ],
    expected: [
      { checkCode: 'H219', decisionCode: 'H01' },
      { checkCode: 'H220', decisionCode: 'X00' }
    ]
  },
  {
    name: 'valid',
    cheds: [
      {
        template: 'CHEDD',
        documents: [{ DocumentCode: 'N852' }]
      },
      {
        template: 'CHEDPP_GMS',
        documents: [{ DocumentCode: 'N002' }]
      }
    ],
    checks: [
      { CheckCode: 'H220', DepartmentCode: 'HMI' },
      { CheckCode: 'H223', DepartmentCode: 'PHA' }
    ],
    expected: [
      { checkCode: 'H223', decisionCode: 'C03' },
      { checkCode: 'H220', decisionCode: 'C03' }
    ]
  },
  {
    name: 'valid',
    cheds: [
      {
        template: 'CHEDD',
        documents: [{ DocumentCode: 'N852' }]
      }
    ],
    checks: [
      { CheckCode: 'H220', DepartmentCode: 'HMI' },
      { CheckCode: 'H223', DepartmentCode: 'PHA' }
    ],
    expected: [
      { checkCode: 'H223', decisionCode: 'C03' },
      { checkCode: 'H220', decisionCode: 'X00' }
    ]
  },
  {
    name: 'valid',
    cheds: [
      {
        template: 'CHEDD',
        documents: [{ DocumentCode: 'N852' }]
      },
      {
        template: 'CHEDPP',
        documents: [{ DocumentCode: 'N851' }]
      }
    ],
    checks: [
      { CheckCode: 'H220', DepartmentCode: 'HMI' },
      { CheckCode: 'H223', DepartmentCode: 'PHA' },
      { CheckCode: 'H219', DepartmentCode: 'PHSI' }
    ],
    expected: [
      { checkCode: 'H223', decisionCode: 'C03' },
      { checkCode: 'H220', decisionCode: 'X00' },
      { checkCode: 'H219', decisionCode: 'H01' }
    ]
  },
  {
    name: 'valid',
    cheds: [
      {
        template: 'CHEDD',
        documents: [{ DocumentCode: 'N852' }]
      },
      {
        template: 'CHEDPP_GMS',
        documents: [{ DocumentCode: 'N851' }, { DocumentCode: 'N002' }]
      }
    ],
    checks: [
      { CheckCode: 'H220', DepartmentCode: 'HMI' },
      { CheckCode: 'H223', DepartmentCode: 'PHA' },
      { CheckCode: 'H219', DepartmentCode: 'PHSI' }
    ],
    expected: [
      { checkCode: 'H223', decisionCode: 'C03' },
      { checkCode: 'H220', decisionCode: 'C03' },
      { checkCode: 'H219', decisionCode: 'C03' }
    ]
  }
]

describe('GMS', function () {
  cases.forEach(({ name, cheds = [], checks = [], decisionCode, expected }) => {
    const lettersJoined =
      cheds.map((c) => chedLetter(c.template)).join('+') || 'NA'
    const docCodesJoined =
      cheds
        .flatMap((c) => c.documents || [])
        .map((d) => d.DocumentCode)
        .join('+') || 'NA'
    const checkLabels =
      checks.map((c) => `${c.DepartmentCode}_${c.CheckCode}`).join('+') || 'NA'

    it(`${checkLabels}_with_${docCodesJoined}_and_${lettersJoined}_is_${name}`, async function () {
      testLogger.info('Send IPAFFS notifications per CHED with shared docRef')
      let increment = 1
      const docRefByTemplate = {}

      for (const { template } of cheds) {
        const letter = chedLetter(template)

        const docRef = await generateDocumentReference({
          letter,
          prefixLength: 4,
          increment
        })
        docRefByTemplate[template] = docRef
        increment++

        const payload = await loadIPAFFSJson(template + '.json', {
          referenceNumber: docRef,
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
        await sendIpaffsMessage(payload)
      }

      const allDocuments = cheds.flatMap(({ template, documents = [] }) =>
        documents.map((d) =>
          d.DocumentReference
            ? d
            : { ...d, DocumentReference: docRefByTemplate[template] }
        )
      )

      this.mrn = generateRandomMRN()

      await newClearanceRequest()
        .addItem({
          TaricCommodityCode: '0103911000',
          Documents: allDocuments,
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
  })
})

function chedLetter(jsonTemplate) {
  return jsonTemplate.replace(/^CHED([A-Z]+).*$/, '$1')
}

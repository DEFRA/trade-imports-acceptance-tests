describe('BTMS receives an update to an existing IPAFFS Notification - New → In Progress → Cancelled - IPS-2', function () {
  const testDataArray = [
    {
      testName: 'CHEDA with H221 check - Cancelled',
      chedType: 'CHEDA',
      TaricCommodityCode: '0103911000',
      Doccode: 'C640',
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
      submittedDecisions: { checkCode: 'H221', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H221', decision: 'H02' },
      finalDecisions: { checkCode: 'H221', decision: 'X00' },
      finalIpaffsPayload: {
        version: 3,
        status: 'CANCELLED',
        decisionBy: {},
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      }
    },
    {
      testName: 'CHEDD with H222 check - Cancelled',
      chedType: 'CHEDD',
      TaricCommodityCode: '0908110000',
      Doccode: 'C678',
      Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
      submittedDecisions: { checkCode: 'H223', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H223', decision: 'H02' },
      finalDecisions: { checkCode: 'H223', decision: 'X00' },
      finalIpaffsPayload: {
        version: 3,
        status: 'CANCELLED',
        decisionBy: {
          displayName: 'Jane Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba61'
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      }
    },
    {
      testName: 'CHEDP with H223 check - Cancelled',
      chedType: 'CHEDP',
      TaricCommodityCode: '0709601000',
      Doccode: 'N853',
      Checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
      submittedDecisions: { checkCode: 'H222', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H222', decision: 'H02' },
      finalDecisions: { checkCode: 'H222', decision: 'X00' },
      finalIpaffsPayload: {
        version: 3,
        status: 'CANCELLED',
        decisionBy: {
          displayName: 'Bob Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba62'
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      }
    },
    {
      testName: 'CHEDPP with multiple checks - Cancelled',
      chedType: 'CHEDPP',
      TaricCommodityCode: '8432100000',
      Doccode: ['N851', 'N002'],
      Checks: [
        { CheckCode: 'H219', DepartmentCode: 'PHSI' },
        { CheckCode: 'H218', DepartmentCode: 'HMI' }
      ],
      submittedDecisions: [
        { checkCode: 'H219', decision: 'H02' },
        { checkCode: 'H218', decision: 'H02' }
      ],
      inprogressDecisions: [
        { checkCode: 'H219', decision: 'H02' },
        { checkCode: 'H218', decision: 'H02' }
      ],
      finalDecisions: [
        { checkCode: 'H219', decision: 'X00' },
        { checkCode: 'H218', decision: 'X00' }
      ],
      finalIpaffsPayload: {
        version: 3,
        status: 'CANCELLED',
        decisionBy: {
          displayName: 'Multi Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba63'
        },
        partTwo: {
          decision: {},
          inspectionRequired: 'Required'
        }
      }
    }
  ]

  testDataArray.forEach((testData) => {
    it(testData.testName, async function () {
      this.timeout(70000)

      testLogger.info('Send initial IPAFFS notification')
      this.docRef = await generateDocumentReference()
      this.mrn = generateRandomMRN()

      await sendIpaffsMessage(
        loadIPAFFSJson(`${testData.chedType}.json`, {
          version: 1,
          status: 'SUBMITTED',
          referenceNumber: this.docRef,
          lastUpdated: new Date().toISOString(),
          partTwo: {
            decision: {},
            inspectionRequired: 'Required'
          }
        })
      )

      await newClearanceRequest()
        .addItem({
          TaricCommodityCode: testData.TaricCommodityCode,
          Documents: Array.isArray(testData.Doccode)
            ? testData.Doccode.map((docCode) => ({
                DocumentCode: docCode,
                DocumentReference: this.docRef
              }))
            : [
                {
                  DocumentCode: testData.Doccode,
                  DocumentReference: this.docRef
                }
              ],
          Checks: testData.Checks
        })
        .withMRN(this.mrn)
        .withEntryVersionNumber(1)
        .sendClearanceRequest()
        .then(async (test) => {
          // Handle both single decision and array of decisions
          const decisions = Array.isArray(testData.submittedDecisions)
            ? testData.submittedDecisions
            : [testData.submittedDecisions]

          for (const decision of decisions) {
            await test.waitForCheckDecision(
              decision.checkCode,
              decision.decision
            )
          }
        })

      await sendIpaffsMessage(
        loadIPAFFSJson(`${testData.chedType}.json`, {
          referenceNumber: this.docRef,
          lastUpdated: new Date().toISOString(),
          version: 2,
          status: 'IN_PROGRESS',
          partTwo: {
            decision: {},
            inspectionRequired: 'Required'
          }
        })
      )
      await waitForDataInAPI(this.docRef, 'IPAFFS', {
        importPreNotification: { version: 2, status: 'IN_PROGRESS' }
      })

      // Handle both single decision and array of decisions for in-progress
      const inprogressDecisions = Array.isArray(testData.inprogressDecisions)
        ? testData.inprogressDecisions
        : [testData.inprogressDecisions]

      for (const decision of inprogressDecisions) {
        await waitForSpecificCheckDecision(
          this.mrn,
          decision.checkCode,
          decision.decision
        )
      }

      await sendIpaffsMessage(
        loadIPAFFSJson(`${testData.chedType}.json`, {
          referenceNumber: this.docRef,
          lastUpdated: new Date().toISOString(),
          ...testData.finalIpaffsPayload
        })
      )
      await waitForDataInAPI(this.docRef, 'IPAFFS', {
        importPreNotification: {
          version: testData.finalIpaffsPayload.version,
          status: testData.finalIpaffsPayload.status
        }
      })

      // Handle both single decision and array of decisions for final
      const finalDecisions = Array.isArray(testData.finalDecisions)
        ? testData.finalDecisions
        : [testData.finalDecisions]

      for (const decision of finalDecisions) {
        await waitForSpecificCheckDecision(
          this.mrn,
          decision.checkCode,
          decision.decision
        )
      }
    })
  })
})

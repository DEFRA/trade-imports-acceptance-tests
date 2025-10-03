describe('BTMS receives an update to an existing IPAFFS Notification - New → In Progress → Replaced - IPS-4', function () {
  const testDataArray = [
    {
      testName: 'CHEDA with H221 check - Replaced',
      chedType: 'CHEDA',
      TaricCommodityCode: '0103911000',
      Doccode: 'C640',
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
      submittedDecisions: { checkCode: 'H221', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H221', decision: 'H02' },
      finalDecisions: { checkCode: 'H221', decision: 'X00' },
      finalIpaffsPayload: {
        version: 3,
        status: 'REPLACED',
        decisionBy: {
          displayName: 'Andrew Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market',
            definitiveImportPurpose: 'quarantine'
          },
          consignmentCheck: {
            euStandard: 'Not Set',
            documentCheckResult: 'Satisfactory',
            nationalRequirements: 'Not Set',
            additionalGuarantees: 'Not Set',
            identityCheckResult: 'Satisfactory',
            physicalCheckResult: 'Satisfactory',
            welfareCheck: 'Satisfactory',
            numberOfAnimalsChecked: 1
          },
          impactOfTransportOnAnimals: {
            numberOfDeadAnimals: 0,
            numberOfDeadAnimalsUnit: 'number',
            numberOfUnfitAnimals: 0,
            numberOfUnfitAnimalsUnit: 'number',
            numberOfBirthOrAbortion: 0
          },
          laboratoryTestsRequired: false,
          resealedContainersIncluded: false,
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Andrew',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2024-08-08T10:28:42.692278281'
            }
          },
          controlledDestination: {
            id: '81c32810-0327-49a3-9eb6-7ac0f6f30632',
            type: 'destination',
            status: 'nonapproved',
            companyName: 'aaa',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: 'a',
              addressLine2: 'a',
              addressLine3: 'a',
              city: 'a',
              postalZipCode: 'W1 1AA',
              countryISOCode: 'GB',
              ukTelephone: '02890790598',
              telephone: '02890790598',
              email: 'jm@jmagee.com'
            },
            tracesId: 10056935
          },
          inspectionRequired: 'Required'
        },
        partThree: {
          controlStatus: 'REQUIRED',
          sealCheckRequired: false
        },
        replacedBy: 'CHEDA.GB.2025.1068461'
      }
    },
    {
      testName: 'CHEDD with H222 check - Replaced',
      chedType: 'CHEDD',
      TaricCommodityCode: '0908110000',
      Doccode: 'C678',
      Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
      submittedDecisions: { checkCode: 'H223', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H223', decision: 'H02' },
      finalDecisions: { checkCode: 'H223', decision: 'X00' },
      finalIpaffsPayload: {
        version: 3,
        status: 'REPLACED',
        decisionBy: {
          displayName: 'Jane Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba61'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market',
            definitiveImportPurpose: 'quarantine'
          },
          consignmentCheck: {
            documentCheckResult: 'Satisfactory',
            identityCheckDone: true,
            identityCheckResult: 'Satisfactory',
            physicalCheckDone: true,
            physicalCheckResult: 'Satisfactory'
          },
          laboratoryTestsRequired: false,
          resealedContainersIncluded: false,
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Jane',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7296',
              signed: '2024-08-08T10:28:42.692278281'
            }
          },
          controlledDestination: {
            id: '81c32810-0327-49a3-9eb6-7ac0f6f30633',
            type: 'destination',
            status: 'nonapproved',
            companyName: 'bbb',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: 'b',
              addressLine2: 'b',
              addressLine3: 'b',
              city: 'b',
              postalZipCode: 'W2 2BB',
              countryISOCode: 'GB',
              ukTelephone: '02890790599',
              telephone: '02890790599',
              email: 'test@test.com'
            },
            tracesId: 10056936
          },
          inspectionRequired: 'Required'
        },
        partThree: {
          controlStatus: 'REQUIRED',
          sealCheckRequired: false
        },
        replacedBy: 'CHEDD.GB.2025.1068462'
      }
    },
    {
      testName: 'CHEDP with H223 check - Replaced',
      chedType: 'CHEDP',
      TaricCommodityCode: '0709601000',
      Doccode: 'N853',
      Checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
      submittedDecisions: { checkCode: 'H222', decision: 'H02' },
      inprogressDecisions: { checkCode: 'H222', decision: 'H02' },
      finalDecisions: { checkCode: 'H222', decision: 'X00' },
      finalIpaffsPayload: {
        version: 3,
        status: 'REPLACED',
        decisionBy: {
          displayName: 'Bob Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba62'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable if Channeled',
            ifChanneledOption: 'article8'
          },
          consignmentCheck: {
            documentCheckResult: 'Not Done',
            identityCheckType: 'Not Done',
            identityCheckResult: 'Not Done',
            identityCheckNotDoneReason: 'Reduced checks regime',
            physicalCheckResult: 'Not Done',
            physicalCheckNotDoneReason: 'Reduced checks regime'
          },
          laboratoryTestsRequired: false,
          resealedContainersIncluded: false,
          controlAuthority: {
            officialVeterinarian: {
              firstName: 'Bob',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7297',
              signed: '2024-08-08T10:28:42.692278281'
            }
          },
          controlledDestination: {
            id: '81c32810-0327-49a3-9eb6-7ac0f6f30634',
            type: 'destination',
            status: 'nonapproved',
            companyName: 'ccc',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: 'c',
              addressLine2: 'c',
              addressLine3: 'c',
              city: 'c',
              postalZipCode: 'W3 3CC',
              countryISOCode: 'GB',
              ukTelephone: '02890790600',
              telephone: '02890790600',
              email: 'test2@test.com'
            },
            tracesId: 10056937
          },
          inspectionRequired: 'Not required'
        },
        partThree: {
          controlStatus: 'REQUIRED',
          sealCheckRequired: false
        },
        replacedBy: 'CHEDP.GB.2025.1068463'
      }
    },
    {
      testName: 'CHEDPP with multiple checks - Replaced',
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
        status: 'REPLACED',
        decisionBy: {
          displayName: 'Multi Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba63'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market',
            definitiveImportPurpose: 'quarantine'
          },
          commodityChecks: [
            {
              uniqueComplementId: '7d7bfacd-871e-41c0-906d-4c8722824893',
              checks: [
                {
                  type: 'PHSI_DOCUMENT',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_IDENTITY',
                  status: 'Compliant'
                },
                {
                  type: 'PHSI_PHYSICAL',
                  status: 'Compliant'
                },
                {
                  type: 'HMI',
                  status: 'Compliant'
                }
              ]
            }
          ],
          controlledDestination: {
            id: '81c32810-0327-49a3-9eb6-7ac0f6f30635',
            type: 'destination',
            status: 'nonapproved',
            companyName: 'ddd',
            otherIdentifier: 'ABP',
            address: {
              addressLine1: 'd',
              addressLine2: 'd',
              addressLine3: 'd',
              city: 'd',
              postalZipCode: 'W4 4DD',
              countryISOCode: 'GB',
              ukTelephone: '02890790601',
              telephone: '02890790601',
              email: 'test3@test.com'
            },
            tracesId: 10056938
          },
          inspectionRequired: 'Required'
        },
        partThree: {
          controlStatus: 'REQUIRED',
          sealCheckRequired: false
        },
        replacedBy: 'CHEDPP.GB.2025.1068464'
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

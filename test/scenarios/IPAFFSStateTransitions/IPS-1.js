describe('BTMS receives an update to an existing IPAFFS Notification - NEW → In Progress → Valid - IPS-1', function () {
  const testDataArray = [
    {
      testName: 'CHEDA - Acceptable for Temporary Import',
      chedType: 'CHEDA',
      TaricCommodityCode: '0103911000',
      Doccode: ['C640'],
      Checks: [{ CheckCode: 'H221', DepartmentCode: 'AHVLA' }],
      submittedDecisions: [{ checkCode: 'H221', decision: 'H01' }],
      inprogressDecisions: [{ checkCode: 'H221', decision: 'H01' }],
      finalDecisions: [{ checkCode: 'H221', decision: 'C05' }],
      finalIpaffsPayload: {
        version: 3,
        status: 'VALIDATED',
        decisionBy: {
          displayName: 'Percy Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            temporaryDeadline: '2025-04-04',
            decision: 'Acceptable for Temporary Import',
            ifChanneledOption: 'article15',
            temporaryExitBip: 'GBEDI4'
          },
          consignmentCheck: {
            euStandard: 'Not Set',
            documentCheckResult: 'Satisfactory',
            nationalRequirements: 'Not Set',
            additionalGuarantees: 'Not Set',
            identityCheckResult: 'Satisfactory',
            physicalCheckResult: 'Satisfactory',
            welfareCheck: 'Satisfactory',
            numberOfAnimalsChecked: 3
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
              firstName: 'Percy',
              lastName: 'Inspector-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-04-08T08:41:15.83498159'
            }
          },
          bipLocalReferenceNumber: 'dfgfdg',
          accompanyingDocuments: [
            {
              documentType: 'importPermit',
              documentReference: 'werwer',
              documentIssueDate: '2025-04-07',
              attachmentId: '0196ad1d-ca3d-42ba-b7ee-7d961f741a31',
              attachmentFilename: 'Screenshot 2024-10-25 a.png',
              attachmentContentType: 'image/png',
              uploadUserId: '79f6dc68-2144-e911-a96a-000d3a29ba60',
              uploadOrganisationId: '767ceb6a-2144-e911-a96c-000d3a29b5de'
            }
          ],
          inspectionRequired: 'Required',
          inspectionOverride: {
            originalDecision: 'Inconclusive',
            overriddenOn: '2025-04-04T19:03:00.698310394Z',
            overriddenBy: {
              displayName: 'Auto-Cleared',
              userId: '00000000-0000-0000-0000-000000000000'
            }
          }
        }
      }
    },
    {
      testName: 'CHEDD - Acceptable for Import',
      chedType: 'CHEDD',
      TaricCommodityCode: '0908110000',
      Doccode: 'C678',
      Checks: [{ CheckCode: 'H223', DepartmentCode: 'PHA' }],
      submittedDecisions: [{ checkCode: 'H223', decision: 'H01' }],
      inprogressDecisions: [{ checkCode: 'H223', decision: 'H01' }],
      finalDecisions: [{ checkCode: 'H223', decision: 'C03' }],
      finalIpaffsPayload: {
        version: 3,
        status: 'VALIDATED',
        decisionBy: {
          displayName: 'Gary Admin-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: '2025-08-08T14:18:43.763262611Z',
        partTwo: {
          decision: {
            consignmentAcceptable: true,
            decision: 'Acceptable for Internal Market',
            freeCirculationPurpose: 'Animal Feeding Stuff'
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
              firstName: 'Gary',
              lastName: 'Admin-Tester',
              email: 'DefraTestBIP@anthunt3.33mail.com',
              phone: '020 8225 7295',
              signed: '2025-08-08T14:18:43.804659204'
            }
          },
          bipLocalReferenceNumber: '1234',
          checkDate: '2025-08-08T17:30:00Z',
          inspectionRequired: 'Required'
        },
        partThree: {
          sealCheckRequired: false
        }
      }
    },
    {
      testName: 'CHEDP - Acceptable for Specific Warehouse',
      chedType: 'CHEDP',
      TaricCommodityCode: '0709601000',
      Doccode: 'N853',
      Checks: [{ CheckCode: 'H222', DepartmentCode: 'PHA' }],
      submittedDecisions: [{ checkCode: 'H222', decision: 'H01' }],
      inprogressDecisions: [{ checkCode: 'H222', decision: 'H01' }],
      finalDecisions: [{ checkCode: 'H222', decision: 'C03' }],
      finalIpaffsPayload: {
        version: 3,
        status: 'VALIDATED',
        decisionBy: {
          displayName: 'Percy Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
          decisionBy: {
            displayName: 'London Tilbury - GBTIL1',
            userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
          },
          decisionDate: '2025-02-05T08:05:02.32102662Z',
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
                firstName: 'London Tilbury - ',
                lastName: 'GBTIL1',
                email: 'APHAServiceDesk@apha.gov.uk',
                phone: '03300 416999',
                signed: '2025-02-05T08:05:02.390844393'
              },
              iuuCheckRequired: false
            },
            consignmentValidation: [
              {
                field:
                  'uk/gov/defra/tracesx/notificationschema/representation/parttwo/',
                message: 'Controlled destination must be selected'
              }
            ],
            checkDate: '2025-02-05T08:05:02.188886102Z',
            inspectionRequired: 'Not required',
            autoClearedDateTime: '2025-02-05T08:05:02.188961175Z'
          },
          partThree: {
            controlStatus: 'REQUIRED',
            sealCheckRequired: false
          }
        }
      }
    },
    {
      testName: 'CHEDPP - Acceptable',
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
        { checkCode: 'H219', decision: 'C03' },
        { checkCode: 'H218', decision: 'C03' }
      ],
      finalIpaffsPayload: {
        version: 3,
        status: 'VALIDATED',
        decisionBy: {
          displayName: 'Percy Inspector-Tester',
          userId: '79f6dc68-2144-e911-a96a-000d3a29ba60'
        },
        decisionDate: new Date().toISOString(),
        partTwo: {
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
          inspectionRequired: 'Required'
        },
        partThree: {}
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
            inspectionRequired: 'Not required'
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
            inspectionRequired: 'Not required'
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
